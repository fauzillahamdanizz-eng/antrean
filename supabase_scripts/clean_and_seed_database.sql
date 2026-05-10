-- Clean up all existing data
TRUNCATE TABLE service_ratings CASCADE;
TRUNCATE TABLE queue_history CASCADE;
TRUNCATE TABLE queue_statistics CASCADE;
TRUNCATE TABLE staff_members CASCADE;
TRUNCATE TABLE queue_entries CASCADE;
TRUNCATE TABLE queues CASCADE;
TRUNCATE TABLE announcements CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Create a sample admin profile (UUID format)
-- You can replace this with your actual Supabase Auth user ID after registration
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Administrator', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample queues
INSERT INTO queues (id, name, description, current_number, status, category, average_service_time, daily_target, created_at)
VALUES
  (gen_random_uuid(), 'Layanan Umum', 'Antrian untuk layanan administrasi umum', 1, 'active', 'general', 15, 100, NOW()),
  (gen_random_uuid(), 'Konsultasi', 'Antrian untuk konsultasi dan pertanyaan', 1, 'active', 'consultation', 20, 50, NOW()),
  (gen_random_uuid(), 'Pendaftaran', 'Antrian untuk pendaftaran baru', 1, 'active', 'registration', 10, 80, NOW());

-- Create sample announcements
INSERT INTO announcements (id, title, content, type, expires_at, created_at)
VALUES
  (gen_random_uuid(), 'Selamat Datang!', 'Sistem manajemen antrian telah aktif. Silakan ambil nomor antrian Anda.', 'info', NOW() + INTERVAL '30 days', NOW()),
  (gen_random_uuid(), 'Jam Operasional', 'Kami melayani Senin - Jumat, 08:00 - 16:00 WIB.', 'important', NOW() + INTERVAL '90 days', NOW());

-- Log setup completion
DO $$
BEGIN
  RAISE NOTICE 'Database cleaned and seeded successfully!';
  RAISE NOTICE 'Sample queues created: Layanan Umum, Konsultasi, Pendaftaran';
  RAISE NOTICE 'Please register a new user or use existing Supabase Auth user';
END $$;
