package pl.geovia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class GameAttemptCountryResultId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "attempt_id", nullable = false)
    private UUID attemptId;

    @Column(name = "country_id", nullable = false, length = 64)
    private String countryId;

    protected GameAttemptCountryResultId() {
    }

    public GameAttemptCountryResultId(UUID attemptId, String countryId) {
        this.attemptId = attemptId;
        this.countryId = countryId;
    }

    public UUID getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(UUID attemptId) {
        this.attemptId = attemptId;
    }

    public String getCountryId() {
        return countryId;
    }

    public void setCountryId(String countryId) {
        this.countryId = countryId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof GameAttemptCountryResultId that)) {
            return false;
        }

        return Objects.equals(attemptId, that.attemptId)
                && Objects.equals(countryId, that.countryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(attemptId, countryId);
    }
}
