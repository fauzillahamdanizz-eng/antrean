-- Drop existing RLS policies if any
DROP POLICY IF EXISTS "Allow public read queues" ON queues;
DROP POLICY IF EXISTS "Allow public read queue_entries" ON queue_entries;
DROP POLICY IF EXISTS "Allow public read announcements" ON announcements;
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public insert queues" ON queues;
DROP POLICY IF EXISTS "Allow public insert queue_entries" ON queue_entries;
DROP POLICY IF EXISTS "Allow public update queues" ON queues;
DROP POLICY IF EXISTS "Allow public update queue_entries" ON queue_entries;

-- Queues table policies (public access for queue system)
CREATE POLICY "Allow public read queues" 
  ON queues FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert queues" 
  ON queues FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update queues" 
  ON queues FOR UPDATE 
  USING (true);

-- Queue entries table policies
CREATE POLICY "Allow public read queue_entries" 
  ON queue_entries FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert queue_entries" 
  ON queue_entries FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update queue_entries" 
  ON queue_entries FOR UPDATE 
  USING (true);

-- Announcements table policies
CREATE POLICY "Allow public read announcements" 
  ON announcements FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert announcements" 
  ON announcements FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update announcements" 
  ON announcements FOR UPDATE 
  USING (true);

-- Profiles table policies
CREATE POLICY "Allow public read profiles" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update profiles" 
  ON profiles FOR UPDATE 
  USING (true);

-- Queue history policies
CREATE POLICY "Allow public read queue_history" 
  ON queue_history FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert queue_history" 
  ON queue_history FOR INSERT 
  WITH CHECK (true);

-- Queue statistics policies
CREATE POLICY "Allow public read queue_statistics" 
  ON queue_statistics FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert queue_statistics" 
  ON queue_statistics FOR INSERT 
  WITH CHECK (true);

-- Staff members policies
CREATE POLICY "Allow public read staff_members" 
  ON staff_members FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert staff_members" 
  ON staff_members FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update staff_members" 
  ON staff_members FOR UPDATE 
  USING (true);

-- Service ratings policies
CREATE POLICY "Allow public read service_ratings" 
  ON service_ratings FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert service_ratings" 
  ON service_ratings FOR INSERT 
  WITH CHECK (true);
