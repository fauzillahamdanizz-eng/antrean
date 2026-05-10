-- Create lokets table
CREATE TABLE IF NOT EXISTS lokets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
  loket_number INTEGER NOT NULL,
  loket_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'break')),
  assigned_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  current_serving_entry_id UUID REFERENCES queue_entries(id) ON DELETE SET NULL,
  total_served_today INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(queue_id, loket_number)
);

-- Create loket_assignments table
CREATE TABLE IF NOT EXISTS loket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loket_id UUID NOT NULL REFERENCES lokets(id) ON DELETE CASCADE,
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_serving_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  service_duration_minutes INTEGER,
  notes TEXT,
  UNIQUE(queue_entry_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lokets_queue_id ON lokets(queue_id);
CREATE INDEX IF NOT EXISTS idx_lokets_status ON lokets(status);
CREATE INDEX IF NOT EXISTS idx_loket_assignments_loket_id ON loket_assignments(loket_id);
CREATE INDEX IF NOT EXISTS idx_loket_assignments_queue_entry_id ON loket_assignments(queue_entry_id);

-- Enable Row Level Security (RLS)
ALTER TABLE lokets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loket_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lokets
CREATE POLICY "Public can view lokets" ON lokets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert lokets" ON lokets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update lokets" ON lokets
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete lokets" ON lokets
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for loket_assignments
CREATE POLICY "Public can view loket assignments" ON loket_assignments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert loket assignments" ON loket_assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update loket assignments" ON loket_assignments
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete loket assignments" ON loket_assignments
  FOR DELETE USING (auth.role() = 'authenticated');
