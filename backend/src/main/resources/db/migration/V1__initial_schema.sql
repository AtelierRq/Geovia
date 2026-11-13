-- V1__initial_schema.sql
-- Initial database schema for Geovia
-- PostgreSQL 17+

-- =========================================================
-- PROFILES
-- =========================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    username VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    city VARCHAR(100),

    guest_import_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (guest_import_status IN (
            'pending',
            'imported',
            'skipped',
            'no_data'
        )),

    guest_import_decided_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_profiles_username_lower
    ON profiles (LOWER(username))
    WHERE username IS NOT NULL;


-- =========================================================
-- DAILY CHALLENGES
-- =========================================================

CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    challenge_date DATE NOT NULL UNIQUE,

    timezone_id VARCHAR(64) NOT NULL DEFAULT 'Europe/Warsaw'
        CHECK (timezone_id = 'Europe/Warsaw'),

    title VARCHAR(200) NOT NULL,

    category_id VARCHAR(64) NOT NULL,
    area_id VARCHAR(64) NOT NULL,
    mode_id VARCHAR(64) NOT NULL,

    question_count INTEGER NOT NULL
        CHECK (question_count > 0),

    time_limit_seconds INTEGER
        CHECK (
            time_limit_seconds IS NULL
            OR time_limit_seconds > 0
        ),

    seed BIGINT NOT NULL,
    algorithm_version VARCHAR(50) NOT NULL,

    questions JSONB NOT NULL
        CHECK (jsonb_typeof(questions) = 'array'),

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published')),

    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_daily_challenge_published_at
        CHECK (
            (status = 'draft' AND published_at IS NULL)
            OR
            (status = 'published' AND published_at IS NOT NULL)
        )
);

CREATE INDEX idx_daily_challenges_status_date
    ON daily_challenges (status, challenge_date);


-- =========================================================
-- GAME ATTEMPTS
-- =========================================================

CREATE TABLE game_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    attempt_type VARCHAR(30) NOT NULL
        CHECK (attempt_type IN ('quiz', 'daily_challenge')),

    category_id VARCHAR(64) NOT NULL,
    area_id VARCHAR(64) NOT NULL,
    mode_id VARCHAR(64) NOT NULL,

    challenge_id UUID
        REFERENCES daily_challenges(id)
        ON DELETE RESTRICT,

    correct_count INTEGER NOT NULL
        CHECK (correct_count >= 0),

    total_questions INTEGER NOT NULL
        CHECK (total_questions > 0),

    score_percent NUMERIC(5, 2) NOT NULL
        CHECK (score_percent >= 0 AND score_percent <= 100),

    duration_ms BIGINT NOT NULL
        CHECK (duration_ms >= 0),

    status VARCHAR(20) NOT NULL
        CHECK (status IN (
            'completed',
            'ended_early',
            'time_expired'
        )),

    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_game_attempt_dates
        CHECK (finished_at >= started_at),

    CONSTRAINT chk_game_attempt_type_challenge
        CHECK (
            (attempt_type = 'quiz' AND challenge_id IS NULL)
            OR
            (attempt_type = 'daily_challenge' AND challenge_id IS NOT NULL)
        ),

    CONSTRAINT chk_game_attempt_correct_count
        CHECK (correct_count <= total_questions)
);

CREATE INDEX idx_game_attempts_user_history
    ON game_attempts (user_id, created_at DESC);

CREATE INDEX idx_game_attempts_category_history
    ON game_attempts (category_id, created_at DESC);

CREATE INDEX idx_game_attempts_challenge_user
    ON game_attempts (challenge_id, user_id);


-- =========================================================
-- GAME ATTEMPT COUNTRY RESULTS
-- =========================================================

CREATE TABLE game_attempt_country_results (
    attempt_id UUID NOT NULL
        REFERENCES game_attempts(id)
        ON DELETE CASCADE,

    country_id VARCHAR(64) NOT NULL
        CHECK (
            country_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        ),

    outcome VARCHAR(20) NOT NULL
        CHECK (outcome IN (
            'correct',
            'incorrect',
            'skipped'
        )),

    PRIMARY KEY (attempt_id, country_id)
);

CREATE INDEX idx_country_results_country_outcome
    ON game_attempt_country_results (country_id, outcome);