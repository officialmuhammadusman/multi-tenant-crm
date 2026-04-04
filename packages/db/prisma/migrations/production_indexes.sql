-- Production indexes migration
-- Run AFTER prisma migrate deploy creates the base tables
-- All use CONCURRENTLY to avoid blocking writes on live traffic

-- 1. Composite cursor pagination index for customers
--    Supports: WHERE org_id = ? AND deleted_at IS NULL ORDER BY created_at DESC, id DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_cursor
  ON customers (organization_id, deleted_at, created_at DESC, id DESC);

-- 2. Partial unique index: one active email per org (soft-delete safe)
--    Allows multiple deleted rows with same email, enforces only 1 active
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email_active
  ON customers (organization_id, email)
  WHERE deleted_at IS NULL;

-- 3. Partial index: fast COUNT of active assignments per user
--    Used in concurrency-safe 5-customer limit check
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_assigned_active
  ON customers (assigned_to)
  WHERE deleted_at IS NULL;

-- 4. Full-text search: generated tsvector column for name + email search
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' || coalesce(email, '')
    )
  ) STORED;

-- GIN index on the generated column for fast full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_search
  ON customers USING GIN (search_vector);

-- 5. Activity log: fast retrieval of logs per entity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_entity_type_time
  ON activity_logs (entity_id, entity_type, timestamp DESC);
