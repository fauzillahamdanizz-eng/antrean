-- Queue Statistics Table
CREATE TABLE IF NOT EXISTS queue_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_served INTEGER DEFAULT 0,
  total_cancelled INTEGER DEFAULT 0,
  total_no_show INTEGER DEFAULT 0,
  average_wait_time INTEGER DEFAULT 0,
  average_service_time INTEGER DEFAULT 0,
  peak_hour VARCHAR(5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(queue_id, date)
);

-- Service Ratings Table
CREATE TABLE IF NOT EXISTS service_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID REFERENCES queue_entries(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff Members Table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'available',
  total_served_today INTEGER DEFAULT 0,
  break_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Queue History Table
CREATE TABLE IF NOT EXISTS queue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL,
  performed_by UUID REFERENCES profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Add missing columns to existing tables
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS service_time_minutes INTEGER;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE queues ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE queues ADD COLUMN IF NOT EXISTS average_service_time INTEGER;
ALTER TABLE queues ADD COLUMN IF NOT EXISTS daily_target INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'info';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_queue_statistics_queue_date ON queue_statistics(queue_id, date);
CREATE INDEX IF NOT EXISTS idx_service_ratings_entry ON service_ratings(queue_entry_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_queue ON staff_members(queue_id);
CREATE INDEX IF NOT EXISTS idx_queue_history_queue ON queue_history(queue_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_priority ON queue_entries(queue_id, priority, status);

-- Enable RLS
ALTER TABLE queue_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_history ENABLE ROW LEVEL SECURITY;
