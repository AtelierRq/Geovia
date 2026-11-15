package pl.geovia.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_challenge_attempt_sessions")
public class DailyChallengeAttemptSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Profile user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "challenge_id", nullable = false)
    private DailyChallenge challenge;

    @Column(name = "started_at", nullable = false, updatable = false)
    private OffsetDateTime startedAt;

    @Column(name = "consumed_at")
    private OffsetDateTime consumedAt;

    protected DailyChallengeAttemptSession() {}

    public DailyChallengeAttemptSession(Profile user, DailyChallenge challenge, OffsetDateTime startedAt) {
        this.user = user;
        this.challenge = challenge;
        this.startedAt = startedAt;
    }

    public UUID getId() { return id; }
    public Profile getUser() { return user; }
    public DailyChallenge getChallenge() { return challenge; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public OffsetDateTime getConsumedAt() { return consumedAt; }
    public void setConsumedAt(OffsetDateTime consumedAt) { this.consumedAt = consumedAt; }
}
