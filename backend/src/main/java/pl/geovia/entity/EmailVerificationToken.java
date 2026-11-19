package pl.geovia.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "account_email_verification_tokens")
public class EmailVerificationToken {
    @Id private UUID id;
    @Column(name = "account_id", nullable = false) private UUID accountId;
    @Column(name = "token_hash", nullable = false, length = 64) private String tokenHash;
    @Column(name = "expires_at", nullable = false) private OffsetDateTime expiresAt;
    @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    protected EmailVerificationToken() {}
    public EmailVerificationToken(UUID id, UUID accountId, String tokenHash, OffsetDateTime expiresAt) {
        this.id=id; this.accountId=accountId; this.tokenHash=tokenHash; this.expiresAt=expiresAt;
    }
    @PrePersist protected void onCreate() { if (createdAt == null) createdAt = OffsetDateTime.now(); }
    public UUID getAccountId() { return accountId; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
}
