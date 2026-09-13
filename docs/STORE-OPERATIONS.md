# Store Operations — United Olympics Sports
Store entry: `/store` · Admin: `/admin/store` · Account: `/store/login`.

## 1. Catalog (live)
`GET /api/v1/store/products` serves safe public fields from `catalog_products` + `inventory` (active only). No internal notes, supplier data, or privileged pricing leak. To list a product: insert `catalog_products` row (`status='active'`) + `inventory` row. Full merchandising fields (variants/media/collections) are a deferred schema extension — current live mapping is identity/price/currency/availability.

## 2. Cart & wishlist
Anonymous carts persist in versioned localStorage (`uos:store:client-state:v1`) across refreshes. Authenticated sync is deferred; checkout always re-resolves price/inventory server-side — browser totals are display-only.

## 3. Checkout & orders
5-step flow (contact → address → delivery → payment → review). Review submits `POST /api/v1/store/checkout` (auth required) → server computes totals, checks inventory, creates a **`pending`** order with an order number. No charge occurs: payment step honestly reports "provider not configured". Webhooks (when a provider is contracted) must verify signatures, stay idempotent and auditable.

## 4. Admin & statuses
Dashboard shows live catalog counts; orders/revenue/inventory/discounts show honest unavailable states. Order lifecycle (pending → confirmed → paid → processing → shipped → completed / cancelled) activates with the payment provider. Never trust client-submitted prices, discounts, owners or payment results.
