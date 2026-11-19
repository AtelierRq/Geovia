package pl.geovia.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;
    @Column(nullable = false, length = 254)
    private String email;
    @Column(name = "pending_email", length = 254)
    private String pendingEmail;
    @Column(name = "email_verified_at")
    private OffsetDateTime emailVerifiedAt;
    @Column(name = "password_hash", nullable = false, length = 200)
    private String passwordHash;
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Account() {}
    public Account(UUID id, String email, String passwordHash) {
        this.id = id; this.email = email; this.passwordHash = passwordHash;
    }
    @PrePersist protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }
    @PreUpdate protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPendingEmail() { return pendingEmail; }
    public void setPendingEmail(String pendingEmail) { this.pendingEmail = pendingEmail; }
    public OffsetDateTime getEmailVerifiedAt() { return emailVerifiedAt; }
    public void setEmailVerifiedAt(OffsetDateTime value) { emailVerifiedAt = value; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
