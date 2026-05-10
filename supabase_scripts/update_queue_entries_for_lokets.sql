-- Add customer_name and loket_id columns to queue_entries if they don't exist
ALTER TABLE queue_entries
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS loket_id UUID REFERENCES lokets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_queue_entries_loket_id ON queue_entries(loket_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_assigned_staff_id ON queue_entries(assigned_staff_id);
