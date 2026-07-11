-- =====================================================
-- UNIHUB CENTRALIZED AUTH — USERS TABLE
-- =====================================================

-- Create the role ENUM type (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'faculty', 'canteen_admin', 'xerox_admin');
  END IF;
END
$$;

-- Create users table (idempotent)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  role          user_role     NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Add role column to users if it was created before this migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'student';

-- =====================================================
-- SEED DEMO USERS (one per role)
-- Passwords are bcrypt hashes of the plaintext shown below.
--   student      → password: student123
--   faculty      → password: faculty123
--   canteen_admin→ password: canteen123
--   xerox_admin  → password: xerox123
-- =====================================================
INSERT INTO users (name, email, password_hash, role)
VALUES
  (
    'Demo Student',
    'student@unihub.com',
    '$2b$10$P7SwsGHtgWEC3eiJHa1mUeWVrQMT7JgLuq/6ABM6c1ZL8RXXWnaJe',
    'student'
  ),
  (
    'Dr. Faculty',
    'faculty@unihub.com',
    '$2b$10$RnY3.zW8CbsbT/zP9EaiZO6SltMMagTLnckxLBFuk/xOWHwVi1iTW',
    'faculty'
  ),
  (
    'Canteen Manager',
    'canteen@unihub.com',
    '$2b$10$hhdzmJ7wIyMbwzBa04t1LOSqcLlr/TvYwjYMRBFf4Sl2.pNCzv1vS',
    'canteen_admin'
  ),
  (
    'Xerox Operator',
    'xerox@unihub.com',
    '$2b$10$umoJIDnTJuF7EhJiQTcck.H4UpXDYVs/acXszihpW2MBXM8QBl1sC',
    'xerox_admin'
  )
ON CONFLICT (email) DO NOTHING;
