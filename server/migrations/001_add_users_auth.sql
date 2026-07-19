-- ============================================================
-- Migration 001: Add user authentication
-- ============================================================
-- Safe to run on an EXISTING database that already has
-- food_items, user_meals and user_goals but no users table.
--
-- Run with:
--   psql "$DATABASE_URL" -f migrations/001_add_users_auth.sql
-- or locally:
--   psql -U postgres -d mealsdb -f migrations/001_add_users_auth.sql
--
-- The whole migration runs in a single transaction so it either
-- fully applies or rolls back on error.
-- ============================================================

BEGIN;

-- 1. Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Remove orphaned rows that would violate the new FK constraints.
--    (rows whose user_id has no matching users.id, e.g. the old
--     hardcoded user_id = 1 demo data)
DELETE FROM user_meals  WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM user_goals  WHERE user_id NOT IN (SELECT id FROM users);

-- 3. Add FK constraint on user_meals.user_id -> users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_meals_user_id_fkey'
          AND table_name = 'user_meals'
    ) THEN
        ALTER TABLE user_meals
            ADD CONSTRAINT user_meals_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END$$;

-- 4. Add FK constraint on user_goals.user_id -> users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_goals_user_id_fkey'
          AND table_name = 'user_goals'
    ) THEN
        ALTER TABLE user_goals
            ADD CONSTRAINT user_goals_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END$$;

COMMIT;
