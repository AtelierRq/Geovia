package pl.geovia.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "friend_relations")
public class FriendRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_profile_id", nullable = false)
    private Profile requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_profile_id", nullable = false)
    private Profile recipient;

    @Column(nullable = false, length = 16)
    private String status = "pending";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected FriendRelation() {}

    public FriendRelation(Profile requester, Profile recipient) {
        this.requester = requester;
        this.recipient = recipient;
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public Profile getRequester() { return requester; }
    public Profile getRecipient() { return recipient; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
