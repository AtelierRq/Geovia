ALTER TABLE account_sessions ADD COLUMN user_agent VARCHAR(512);

CREATE TABLE account_password_reset_tokens (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_password_reset_tokens_expiry ON account_password_reset_tokens (expires_at);
