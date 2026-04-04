# Multi-Tenant CRM System

Production-grade monorepo — NestJS 11 backend + Next.js 16 frontend + PostgreSQL + Redis.

---

## How to Run

### Prerequisites
- Node.js 20+  |  pnpm 9+ (`npm i -g pnpm`)  |  Docker Desktop

### 1. Clone & install
```bash
pnpm install
```

### 2. Environment
```bash
cp .env.example .env
# Edit .env — set JWT_SECRET to any string >= 32 characters
```

### 3. Start infrastructure
```bash
docker-compose up -d postgres redis
# Wait ~15s for health checks to pass
```

### 4. Database setup
```bash
pnpm db:generate          # Generate Prisma client
pnpm db:migrate:dev       # Run migrations
pnpm db:seed              # Seed with test data
```

### 5. Apply production indexes (once)
```bash
# If psql is installed locally:
psql $DATABASE_URL -f packages/db/prisma/migrations/production_indexes.sql

# Or via Docker:
docker exec -i crm_postgres psql -U crm_user -d crm_db \
  < packages/db/prisma/migrations/production_indexes.sql
```

### 6. Start everything
```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API      | http://localhost:3001/api/v1 |
| Swagger  | http://localhost:3001/api/docs |

---

## Test Credentials (after seed)

| Role        | Email                     | Password       |
|-------------|---------------------------|----------------|
| Super Admin | superadmin@system.com     | SuperAdmin@123 |
| Acme Admin  | admin@acmeinc.com         | Admin@123456   |
| Acme Member | member1@acmeinc.com       | Member@123456  |
| Beta Admin  | admin@betacorp.com        | Admin@123456   |
| Beta Member | member1@betacorp.com      | Member@123456  |

---

## Project Structure

```
crm-monorepo/
├── apps/
│   ├── api/              NestJS 11 — controllers, services, guards, modules
│   └── web/              Next.js 16 — App Router, shadcn/ui, Redux Toolkit
├── packages/
│   ├── types/            Shared Zod schemas + TypeScript types (used by both apps)
│   └── db/               Prisma schema, migrations, seed script
├── docs/                 Role permissions matrix
├── scripts/              Concurrency test script
├── docker-compose.yml
└── turbo.json
```

---

## Architecture Decisions

### Why Turborepo + pnpm workspaces
`packages/types` is the single Zod schema source imported by both NestJS (via `ZodValidationPipe`) and Next.js (via `@hookform/resolvers/zod`). One schema change propagates everywhere. TypeScript catches mismatches at compile time, not runtime. Zero schema duplication, zero drift between frontend validation and backend validation.

### Why NestJS 11
Decorator-based DI enforces clean separation: controllers handle HTTP only, services handle business logic only. The module system prevents circular dependencies. Global guards, filters, and interceptors are registered once and apply everywhere consistently.

### Why Prisma 6
Generated TypeScript client matches the schema exactly. The Client Extension intercepts every query — tenant isolation is structurally impossible to bypass even if a developer forgets to add a `WHERE` clause. Raw SQL via `$queryRaw` handles the cases where the ORM abstracts too much (FOR UPDATE locking, full-text search).

### Why Next.js 16 with App Router
Server Components render the customer list on the server — no loading flash on first visit, SEO-indexable. Turbopack is the default bundler (2-5× faster builds). React Compiler automatically memoises components — no manual `useMemo`/`useCallback` needed.

### Why Redux Toolkit + custom hooks
RTK manages auth state (JWT, user, active org). Custom domain hooks (`useCustomers`, `useActivity`, `useUsers`, etc.) encapsulate all data-fetching logic. Pages are pure UI — zero business logic inline. The `useCurrentUser` hook centralises all permission checks (`canEditCustomer`, `canDeleteCustomer`, etc.) so role logic is defined once and tested once.

---

## How Multi-Tenancy Isolation is Enforced

**Two independent layers** — if either fails, the other still protects.

**Layer 1 — Prisma Client Extension (database layer)**
Intercepts every `findMany`, `findFirst`, `findUnique`, `create`, `update`, `delete`. Reads `organizationId` from `AsyncLocalStorage` (populated by `JwtAuthGuard` on every request). Automatically appends `WHERE organization_id = :orgId` to every query. Super admins (`isSuperAdmin: true`) bypass this automatically.

**Layer 2 — TenantGuard (HTTP layer)**
On every route that accepts a resource ID: fetches the resource's `organizationId` from the database, compares to the JWT's `organizationId`. Mismatch → 403 before the controller executes. Super admins bypass this guard.

---

## How Concurrency Safety is Achieved

**Problem**: Two simultaneous requests both read assignedCount = 4, both pass the ≤5 check, both assign → 6 customers.

**Solution**: Pessimistic row-level locking with a consistent lock ordering.

```sql
BEGIN;
-- Lock user row FIRST (always first — deadlock prevention)
SELECT id FROM users WHERE id = $1 FOR UPDATE;
-- Lock customer row SECOND (always second)
SELECT id, assigned_to FROM customers WHERE id = $2 FOR UPDATE;
-- Count active assignments (partial index: WHERE deleted_at IS NULL)
SELECT COUNT(*) FROM customers WHERE assigned_to = $1 AND deleted_at IS NULL;
-- If count >= 5 → ROLLBACK + 409
-- Otherwise: assign + write activity log + COMMIT
```

**Deadlock prevention**: Lock order is always user → customer everywhere in the codebase. Two concurrent transactions can never deadlock because they always queue at the same lock in the same order.

**Why pessimistic over optimistic**: Assignment is low-frequency (< 10/user/day in a CRM). The serialization cost of `FOR UPDATE` is negligible. Optimistic locking would require retry logic on version conflicts — more code, no measurable benefit.

**Test it**:
```bash
chmod +x scripts/test-concurrency.sh && ./scripts/test-concurrency.sh
# Expected: ≤5 succeed (HTTP 200), ≥95 conflict (HTTP 409)
```

---

## Performance Strategy and Indexing

### Cursor pagination (not offset)
`OFFSET 50000` scans and discards 50k rows every time. Cursor pagination hits the index directly:
```sql
WHERE organization_id = $1 AND deleted_at IS NULL
  AND (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC LIMIT 20
```
The composite index `(organization_id, deleted_at, created_at DESC, id DESC)` makes this a pure index scan at any page depth.

### Full-text search via GIN index
```sql
ALTER TABLE customers ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(email,''))) STORED;
CREATE INDEX CONCURRENTLY idx_customers_search ON customers USING GIN (search_vector);
```
Search: `WHERE search_vector @@ plainto_tsquery('english', $1)` — no table scan.

### The five production indexes
| Index | Purpose |
|-------|---------|
| `(org_id, deleted_at, created_at DESC, id DESC)` | Cursor pagination |
| `(org_id, email) WHERE deleted_at IS NULL` | Unique active email per org |
| `(assigned_to) WHERE deleted_at IS NULL` | Fast 5-customer count |
| `GIN (search_vector)` | Full-text search |
| `(entity_id, entity_type, timestamp DESC)` | Per-entity activity log |

All use `CREATE INDEX CONCURRENTLY` — zero table locks on a live database.

### N+1 prevention
All list queries use Prisma `include` with explicit `select` to fetch related data in one round trip. The customer list fetches assigned user name + org name in the same query.

---

## How You Would Scale This System

**10× (immediate — no code changes)**
- PgBouncer connection pooling in front of PostgreSQL
- Redis caching for the users list (assignment dropdowns, rarely changes)
- Multiple API instances behind a load balancer (Redis blocklist already shared)

**100× (medium term)**
- Move activity log writes to BullMQ queue — removes ~5ms from every mutation response
- PostgreSQL read replicas — route all SELECTs to replicas via Prisma replica routing
- CDN-cache the Next.js page shells, stream data with Suspense

**1000× (long term)**
- Shard by `organizationId` — the JWT already carries the shard key
- Separate activity logs into TimescaleDB — append-only, time-series, 1M+ inserts/second
- Event sourcing for the activity log — replace polling with WebSocket push

---

## Trade-offs Made

**Pessimistic vs optimistic locking**: Chose pessimistic. CRM assignment is low-frequency. Correctness outweighs throughput. Optimistic locking adds retry complexity with no measurable benefit at this scale.

**Cursor vs offset pagination**: Cannot jump to arbitrary pages. CRM use is sequential (page forward, search). Nobody navigates to page 47. Performance at 100k+ records is decisive.

**IP-based rate limiting**: Behind corporate NAT, all users share one IP. The correct solution is `(organizationId, userId)` token bucket in Redis. Infrastructure already exists. Documented as known limitation.

**Access token in Redux memory**: Not in localStorage (XSS risk). Full-page reload loses the token — silent refresh via HTTP-only cookie restores it transparently within one request. Users never notice, XSS cannot steal it.

**Shared Zod schemas**: Backend schema is the authority. Frontend forms break at compile time if the backend changes a field. This is a feature (early detection) that feels like a constraint (coupled packages).

---

## Production Improvements Implemented

**Refresh token rotation + revocation**: 15-minute access tokens, 7-day refresh tokens rotated on every use. Reuse detection revokes the entire session. Access token `jti` blocklisted in Redis on logout.

**Row-level locking**: Prevents TOCTOU race on the 5-customer assignment limit.

**Swagger documentation**: All endpoints, DTOs, and responses decorated. Available at `/api/docs`.

**Rate limiting**: 100 req/min globally, 20 req/min on the assignment endpoint.

**Structured JSON logging**: Every log line carries a `correlationId` for end-to-end tracing.

**Helmet security headers**: XSS, clickjacking, and other browser-level protections.

**Environment validation at startup**: Zod validates every required env variable on boot. Missing or malformed variables cause an immediate crash with a clear error — never a subtle runtime failure.

---

## Role Permissions Matrix

| Action              | Super Admin       | Admin         | Member                        |
|---------------------|-------------------|---------------|-------------------------------|
| Create customer     | ✅                | ✅            | ✅ (auto-assigned to self)    |
| Edit customer       | ✅ any            | ✅ own org    | ✅ only if assignedTo === self |
| Delete customer     | ✅                | ✅            | ❌                             |
| Restore customer    | ✅                | ✅            | ❌                             |
| Assign customer     | ✅ no limit       | ✅ 5-limit    | ❌                             |
| Create note         | ✅ any            | ✅ own org    | ✅ own org                    |
| Create user         | ✅                | ✅            | ❌                             |
| View activity logs  | ✅ global         | ✅ own org    | ✅ own org                    |
| Manage orgs         | ✅                | ❌            | ❌                             |

See `docs/role-permissions-matrix.md` for enforcement locations.
