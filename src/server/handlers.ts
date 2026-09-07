import { randomUUID } from 'node:crypto';
import { adminAuth } from '../lib/firebase-admin.ts';
import { databaseConfigured, getPool } from '../db/index.ts';
import { assertPlayerRelationship, requireAnyRole, requireIdentity } from './auth.ts';
import { authAdministrativeActionsConfigured, getRuntimeReadiness } from './runtime.ts';
import {
  ApiError,
  assertMethod,
  isUuid,
  normalizeString,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './http.ts';

export type RouteHandler = (req: ApiRequest, res: ApiResponse) => Promise<void>;

function reference(prefix: string): string {
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `${prefix}-${day}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function requireDatabase(): void {
  if (!databaseConfigured()) {
    throw new ApiError(503, 'DATA_SERVICE_NOT_CONFIGURED', 'The production data service is not connected yet.');
  }
}

export const healthHandler: RouteHandler = async (req, res) => {
  assertMethod(req, ['GET']);
  const readiness = getRuntimeReadiness();
  sendJson(res, 200, {
    ok: true,
    service: 'united-olympics-sports',
    status: 'ok',
    productionReady:
      readiness.databaseConfigured &&
      readiness.authVerificationConfigured &&
      readiness.paymentConfigured &&
      readiness.paymentWebhookConfigured,
    dependencies: {
      database: readiness.databaseConfigured ? 'configured' : 'not_configured',
      authVerification: readiness.authVerificationConfigured ? 'configured' : 'not_configured',
      authAdministrativeActions: readiness.authAdministrativeActionsConfigured ? 'configured' : 'not_configured',
      payments: readiness.paymentConfigured ? 'configured' : 'not_configured',
      paymentWebhook: readiness.paymentWebhookConfigured ? 'configured' : 'not_configured',
      sms: readiness.smsConfigured ? 'configured' : 'not_configured',
    },
  });
};

export const sessionHandler: RouteHandler = async (req, res) => {
  assertMethod(req, ['POST']);
  const identity = await requireIdentity(req);
  sendJson(res, 200, {
    ok: true,
    session: {
      uid: identity.uid,
      ...(identity.email ? { email: identity.email } : {}),
      roles: identity.roles,
      scopes: identity.scopes,
    },
  });
};

export const revokeHandler: RouteHandler = async (req, res) => {
  assertMethod(req, ['POST']);
  const identity = await requireIdentity(req);
  if (!authAdministrativeActionsConfigured()) {
    throw new ApiError(503, 'AUTH_ADMIN_NOT_CONFIGURED', 'Session revocation is not configured in this environment.');
  }
  try {
    await adminAuth.revokeRefreshTokens(identity.uid);
  } catch {
    throw new ApiError(503, 'AUTH_ADMIN_UNAVAILABLE', 'Session revocation is temporarily unavailable.');
  }
  sendJson(res, 200, { ok: true, revoked: true });
};

export const adminWhoAmIHandler: RouteHandler = async (req, res) => {
  assertMethod(req, ['GET']);
  const identity = await requireIdentity(req);
  requireAnyRole(identity, ['admin', 'super_admin']);
  sendJson(res, 200, {
    ok: true,
    identity: {
      uid: identity.uid,
      roles: identity.roles,
      scopes: identity.scopes,
    },
  });
};

export const publicEnquiriesHandler: RouteHandler = async (req, res) => {
  assertMethod(req, ['POST']);
  const body = await readJsonBody(req);
  const name = normalizeString(body.name, 120);
  const email = normalizeString(body.email, 254)?.toLowerCase();
  const phone = normalizeString(body.phone, 40);
  const message = normalizeString(body.message, 2000);
  const sport = normalizeString(body.sport, 100);
  const guardianRelationship = normalizeString(body.guardianRelationship, 80);

  if (!name || (!email && !phone)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Name and at least one contact method are required.');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Email address is not valid.');
  }

  requireDatabase();
  const enquiryReference = reference('UOS-ENQ');
  try {
    await getPool().query(
      `insert into public_enquiries
        (reference, name, email, phone, message, sport, guardian_relationship, status)
       values ($1, $2, $3, $4, $5, $6, $7, 'new')`,
      [enquiryReference, name, email ?? null, phone ?? null, message ?? null, sport ?? null, guardianRelationship ?? null],
    );
  } catch {
    throw new ApiError(503, 'DATA_SERVICE_UNAVAILABLE', 'The enquiry could not be saved right now.');
  }

  sendJson(res, 201, { ok: true, reference: enquiryReference, status: 'received' });
};

export const sportRequestHandler: RouteHandler = async (req, res) => {
  assertMethod(req, ['POST']);
  const identity = await requireIdentity(req);
  const body = await readJsonBody(req);
  const playerId = normalizeString(body.playerId, 64);
  const sportId = normalizeString(body.sportId, 64);
  const programId = normalizeString(body.programId, 64);
  const note = normalizeString(body.note, 1000);

  if (!playerId || !sportId || !isUuid(playerId) || !isUuid(sportId)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid playerId and sportId are required.');
  }
  if (programId && !isUuid(programId)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'programId must be a valid UUID when supplied.');
  }

  requireDatabase();
  await assertPlayerRelationship(identity, playerId);
  const requestReference = reference('UOS-REQ');

  try {
    await getPool().query(
      `insert into service_requests
        (reference, requester_uid, player_id, kind, status, payload)
       values ($1, $2, $3, 'sport_registration', 'requested', $4::jsonb)`,
      [requestReference, identity.uid, playerId, JSON.stringify({ sportId, ...(programId ? { programId } : {}), ...(note ? { note } : {}) })],
    );
  } catch {
    throw new ApiError(503, 'DATA_SERVICE_UNAVAILABLE', 'The service request could not be saved right now.');
  }

  sendJson(res, 201, {
    ok: true,
    reference: requestReference,
    status: 'requested',
    pricing: 'pending_server_quote',
  });
};

export const catalogHandler: RouteHandler = async (req, res) => {
  assertMethod(req, ['GET']);
  requireDatabase();
  try {
    const result = await getPool().query<{
      id: string;
      sku: string;
      name: string;
      name_ar: string | null;
      price_minor: number | null;
      currency: string | null;
      available_quantity: number;
    }>(
      `select p.id, p.sku, p.name, p.name_ar, p.price_minor, p.currency,
              coalesce(i.available_quantity, 0)::int as available_quantity
         from catalog_products p
         left join inventory i on i.product_id = p.id
        where p.status = 'active'
        order by p.created_at desc
        limit 200`,
    );
    sendJson(res, 200, { ok: true, items: result.rows });
  } catch {
    throw new ApiError(503, 'DATA_SERVICE_UNAVAILABLE', 'Catalog data is temporarily unavailable.');
  }
};
