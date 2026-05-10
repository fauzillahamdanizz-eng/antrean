-- Make lokets global by removing queue_id requirement
ALTER TABLE lokets DROP CONSTRAINT lokets_queue_id_fkey;
ALTER TABLE lokets DROP CONSTRAINT lokets_queue_id_loket_number_key;
ALTER TABLE lokets DROP COLUMN queue_id;

DROP INDEX IF EXISTS idx_lokets_queue_id;

CREATE INDEX idx_lokets_status_available ON lokets(status) WHERE status = 'available';
