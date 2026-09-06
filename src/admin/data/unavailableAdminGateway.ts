import type { AdminDataGateway } from './AdminDataGateway';

const unavailable = async () => {
  throw new Error('Admin production data service is not connected yet.');
};

/**
 * Production-safe boundary used until a real AdminDataGateway is configured.
 * It deliberately fails reads/writes instead of silently serving preview data.
 */
export const unavailableAdminGateway = new Proxy(
  { mode: 'live' } as AdminDataGateway,
  {
    get(target, property, receiver) {
      if (property === 'mode') return 'live';
      if (property in target) return Reflect.get(target, property, receiver);
      return unavailable;
    },
  },
);
