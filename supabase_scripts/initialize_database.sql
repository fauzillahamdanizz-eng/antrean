-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create queues table
CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  current_number INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create queue_entries table
CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id UUID REFERENCES queues ON DELETE CASCADE,
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  queue_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'serving', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (only if not exists)
INSERT INTO profiles (id, email, full_name, role)
SELECT uuid_generate_v4(), 'admin@example.com', 'Admin User', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@example.com');

-- Insert sample queues (only if not exists)
INSERT INTO queues (name, description, current_number, status)
SELECT 'Customer Service', 'General customer service inquiries', 10, 'active'
WHERE NOT EXISTS (SELECT 1 FROM queues WHERE name = 'Customer Service')
UNION ALL
SELECT 'Technical Support', 'Technical issues and troubleshooting', 5, 'active'
WHERE NOT EXISTS (SELECT 1 FROM queues WHERE name = 'Technical Support')
UNION ALL
SELECT 'Billing', 'Billing inquiries and payment issues', 8, 'paused'
WHERE NOT EXISTS (SELECT 1 FROM queues WHERE name = 'Billing');

-- Insert sample announcements (only if not exists)
INSERT INTO announcements (title, content)
SELECT 'System Maintenance', 'The system will be undergoing maintenance on Saturday from 2 AM to 4 AM.'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'System Maintenance')
UNION ALL
SELECT 'New Queue Feature', 'We have added a new feature to allow you to receive SMS notifications when your queue number is called.'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'New Queue Feature');
