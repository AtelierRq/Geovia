CREATE TABLE friend_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_friend_relation_not_self CHECK (requester_profile_id <> recipient_profile_id)
);

CREATE UNIQUE INDEX uq_friend_relation_pair
    ON friend_relations (LEAST(requester_profile_id, recipient_profile_id), GREATEST(requester_profile_id, recipient_profile_id));

CREATE INDEX ix_friend_relations_recipient_status
    ON friend_relations (recipient_profile_id, status, created_at DESC);

CREATE INDEX ix_friend_relations_requester_status
    ON friend_relations (requester_profile_id, status, created_at DESC);
