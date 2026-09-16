# United Olympics Sports — Store Operations Guide (v1.0.0 closure)

## Catalog

- Live products come from `catalog_products` (`status='active'`) + `inventory`. Draft products and their stock are invisible to anonymous shoppers (RLS 0009).
- Prices are resolved server-side at checkout; the client never decides totals.
- Empty catalog renders an honest empty state, never placeholder products.

## Customer account

- `/store/login` → account pages sit behind `StoreAccountBoundary`: unauthenticated visitors redirect to login; failures terminate in an error + retry state, never a spinner.
- Customers see only their own orders (`customer_uid = ctx.uid`); order detail resolves within that list — unknown references show “Order not found”, never another customer's data.
- Wishlist is per-authenticated-uid and never leaks across users; logout clears identity-scoped state.

## Checkout truth

1. Steps 1–2 collect contact + delivery address (validated).
2. Delivery (step 3), payment method (step 4), and submission (step 5) require configured shipping/tax/payment providers; until then they state what is missing instead of faking success.
3. Order creation reserves inventory in a transaction (`SELECT … FOR UPDATE`, `INSUFFICIENT_INVENTORY 409` on shortfall). Duplicate submits are defended; totals come from the server.

## Payments lifecycle

- Charging is a separate server `payment-intent` call (idempotency key required, 30-min claim TTL).
- States: `pending → paid`, canonical local `cancelled` (Stripe sends the `canceled` spelling; the server normalizes it to `cancelled` on ingest), abandoned claims expire and release inventory, webhook retries are idempotent, provider errors are preserved (never rendered as fake “paid”). Operators must query/filter using the local `cancelled` spelling.
- Webhooks require `PAYMENTS_WEBHOOK_SECRET`; without it they fail closed (503, no mutation). No real charge is made by automated QA — test-mode proof only.

## Store admin (`/admin/store/*`)

Dashboard KPIs show `—` with “Source unavailable” where no live source exists; products/categories/orders/inventory/collections/discounts/settings routes exist and label fixture vs live explicitly. Do not treat `—` as zero revenue.
