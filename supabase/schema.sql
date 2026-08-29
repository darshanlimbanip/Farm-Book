-- Farm Book Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Owners table (linked to auth.users)
CREATE TABLE owners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'gu' CHECK (preferred_language IN ('gu', 'en')),
  pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Farms
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_text TEXT NOT NULL DEFAULT '',
  acres NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workers
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  daily_wage NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Worker farm assignments
CREATE TABLE worker_farm_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  UNIQUE(worker_id, farm_id)
);

-- Attendance
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day');

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(worker_id, date)
);

-- Advances
CREATE TABLE advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expense category enum
CREATE TYPE expense_category AS ENUM (
  'fuel', 'fertilizer', 'seeds', 'equipment', 'labor_other', 'misc'
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  category expense_category NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  note TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Income
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  source_text TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_farms_owner ON farms(owner_id);
CREATE INDEX idx_workers_owner ON workers(owner_id);
CREATE INDEX idx_attendance_worker_date ON attendance(worker_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_advances_worker_date ON advances(worker_id, date);
CREATE INDEX idx_expenses_owner_date ON expenses(owner_id, date);
CREATE INDEX idx_income_owner_date ON income(owner_id, date);

-- Row Level Security
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_farm_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Owners policies
CREATE POLICY "Users can view own owner record"
  ON owners FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own owner record"
  ON owners FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own owner record"
  ON owners FOR UPDATE USING (auth.uid() = id);

-- Farms policies
CREATE POLICY "Owners can manage own farms"
  ON farms FOR ALL USING (auth.uid() = owner_id);

-- Workers policies
CREATE POLICY "Owners can manage own workers"
  ON workers FOR ALL USING (auth.uid() = owner_id);

-- Worker farm assignments policies
CREATE POLICY "Owners can manage worker farm assignments"
  ON worker_farm_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.id = worker_farm_assignments.worker_id
      AND w.owner_id = auth.uid()
    )
  );

-- Attendance policies
CREATE POLICY "Owners can manage attendance for own workers"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.id = attendance.worker_id
      AND w.owner_id = auth.uid()
    )
  );

-- Advances policies
CREATE POLICY "Owners can manage advances for own workers"
  ON advances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.id = advances.worker_id
      AND w.owner_id = auth.uid()
    )
  );

-- Expenses policies
CREATE POLICY "Owners can manage own expenses"
  ON expenses FOR ALL USING (auth.uid() = owner_id);

-- Income policies
CREATE POLICY "Owners can manage own income"
  ON income FOR ALL USING (auth.uid() = owner_id);

-- Storage buckets (run separately in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('worker-photos', 'worker-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipt-photos', 'receipt-photos', true);

-- Storage RLS policies for worker-photos and receipt-photos buckets:
-- CREATE POLICY "Owners can upload own photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Owners can view own photos"
--   ON storage.objects FOR SELECT
--   USING (auth.uid()::text = (storage.foldername(name))[1]);
