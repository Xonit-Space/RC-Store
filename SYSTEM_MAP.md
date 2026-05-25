# Neoshop Ultra - System Route & Feature Map (Phase 6.0.1 Audit)

This document serves as the architecture truth source mapping the current UI and API routes to the backend commerce OS, identifying critical wiring gaps, missing pages, and unconnected events.

## 1. UI Route Audit (`src/app/`)

### Existing Routes
- `/` (Home Page) - Unconnected. Currently a static placeholder. Needs wiring to Product Catalog.
- `/admin` (Admin Dashboard) - Partial. Protected by middleware, but currently a placeholder UI. Missing real-time metrics, queue health monitor, and event stream.

### Missing Critical UI Routes (To Be Built)
- `/login`, `/register` - Authentication UI (Middleware currently redirects to `/login` which doesn't exist).
- `/products`, `/products/[slug]` - Catalog browsing and Product Details (needs inventory wiring).
- `/cart`, `/checkout` - Shopping cart and Checkout flows (needs Redis cart sync and Stripe webhook wiring).
- `/customer` - Customer portal (Orders, Profile, Loyalty points).

## 2. API Handler Audit (`src/app/api/`)

### Existing Handlers
- `/api/auth/[...nextauth]` - Configured for Credentials Auth.
- `/api/webhooks/stripe` - Initial Stripe Webhook endpoint.

### Missing Critical API Handlers
- **Catalog**: `/api/products` (Search, filter, paginate).
- **Cart/Checkout**: `/api/cart` (Redis sync), `/api/checkout` (Create Stripe Session).
- **Admin Commands**: `/api/admin/system/retry`, `/api/admin/metrics` (Queue stats, WS active connections).
- **Events**: `/api/events/replay` (Manual trigger for idempotency/replays).

### Consistency Gap
Currently, existing API routes are NOT using the newly established `withRateLimit` wrapper from Phase 6.1. All endpoints must be wrapped and standardized.

## 3. Event & Background Wiring Audit

### Events Present
- `ORDER_CREATED`
- `PAYMENT_PROCESSED`
- `INVENTORY_RESERVED`

### Orphaned / Unconnected Events
- `ORDER_CREATED` exists in Event Bus but has no direct path updating the UI (needs WebSockets push).
- WebSockets gateway is implemented but not pushing real-time order/inventory updates to the frontend effectively because the UI channels are not built.
- Notifications layer exists conceptually but isn't wired to WebSockets for live toast messages.

## 4. Required Wiring Actions (Phase 6.0)

1. **Standardize APIs**: Wrap every API handler with a `withApiHandler` that enforces `withRateLimit`, Auth, and Telemetry.
2. **Build Missing UI Shells**: Scaffold `/login`, `/products`, and `/cart` so events have a destination.
3. **Connect WebSockets**: Bind frontend contexts to the `ws-gateway.ts` to receive `ORDER_CREATED` and `INVENTORY_RESERVED` updates in real-time.
4. **End-to-End Simulation**: Add integration tests asserting the flow from API to Event Bus to Queue to WebSocket to UI.
