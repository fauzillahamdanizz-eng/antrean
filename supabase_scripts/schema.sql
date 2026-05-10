-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create queues table
CREATE TABLE queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  current_number INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create queue_entries table
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id UUID REFERENCES queues ON DELETE CASCADE,
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  queue_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'serving', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO profiles (id, email, full_name, role)
VALUES (uuid_generate_v4(), 'admin@example.com', 'Admin User', 'admin');

-- Insert sample queues
INSERT INTO queues (name, description, current_number, status)
VALUES 
  ('Customer Service', 'General customer service inquiries', 10, 'active'),
  ('Technical Support', 'Technical issues and troubleshooting', 5, 'active'),
  ('Billing', 'Billing inquiries and payment issues', 8, 'paused');

-- Insert sample announcements
INSERT INTO announcements (title, content)
VALUES 
  ('System Maintenance', 'The system will be undergoing maintenance on Saturday from 2 AM to 4 AM.'),
  ('New Queue Feature', 'We have added a new feature to allow you to receive SMS notifications when your queue number is called.');
