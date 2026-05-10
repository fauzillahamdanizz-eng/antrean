-- Add email_notifications table to track sent notifications
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  queue_entry_id UUID REFERENCES queue_entries(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL CHECK (email_type IN (
    'queue_joined', 
    'queue_called', 
    'queue_serving', 
    'queue_completed', 
    'queue_cancelled',
    'position_update',
    'system_announcement'
  )),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Add notification_preferences table for user preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  queue_joined BOOLEAN DEFAULT true,
  queue_called BOOLEAN DEFAULT true,
  queue_serving BOOLEAN DEFAULT true,
  queue_completed BOOLEAN DEFAULT true,
  queue_cancelled BOOLEAN DEFAULT true,
  position_updates BOOLEAN DEFAULT false,
  announcements BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_queue_entry_id ON email_notifications(queue_entry_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Add RLS policies if needed
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_notifications
CREATE POLICY "Users can view their own notifications" ON email_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" ON email_notifications
  FOR INSERT WITH CHECK (true);

-- RLS policies for notification_preferences
CREATE POLICY "Users can view their preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
