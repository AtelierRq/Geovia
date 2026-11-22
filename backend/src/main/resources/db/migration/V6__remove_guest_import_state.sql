ALTER TABLE profiles
    DROP COLUMN IF EXISTS guest_import_status,
    DROP COLUMN IF EXISTS guest_import_decided_at;
