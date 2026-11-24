ALTER TABLE game_attempts
    ADD COLUMN client_attempt_id UUID;

CREATE UNIQUE INDEX uq_game_attempts_user_client_attempt
    ON game_attempts (user_id, client_attempt_id)
    WHERE client_attempt_id IS NOT NULL;
