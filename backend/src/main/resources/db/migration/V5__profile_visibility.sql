ALTER TABLE profiles
    ADD COLUMN visibility VARCHAR(16) NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private', 'public'));
