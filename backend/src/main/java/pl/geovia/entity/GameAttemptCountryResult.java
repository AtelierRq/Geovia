package pl.geovia.entity;

import pl.geovia.entity.enums.CountryResultOutcome;

import jakarta.persistence.*;

@Entity
@Table(name = "game_attempt_country_results")
public class GameAttemptCountryResult {

    @EmbeddedId
    private GameAttemptCountryResultId id;

    @MapsId("attemptId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private GameAttempt attempt;

    @Convert(converter = CountryResultOutcomeConverter.class)
    @Column(name = "outcome", nullable = false, length = 20)
    private CountryResultOutcome outcome;

    protected GameAttemptCountryResult() {
    }

    public GameAttemptCountryResult(
            GameAttempt attempt,
            String countryId,
            CountryResultOutcome outcome
    ) {
        this.attempt = attempt;
        this.id = new GameAttemptCountryResultId(
                attempt.getId(),
                countryId
        );
        this.outcome = outcome;
    }

    public GameAttemptCountryResultId getId() {
        return id;
    }

    public void setId(GameAttemptCountryResultId id) {
        this.id = id;
    }

    public GameAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(GameAttempt attempt) {
        this.attempt = attempt;
    }

    public String getCountryId() {
        return id != null ? id.getCountryId() : null;
    }

    public CountryResultOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(CountryResultOutcome outcome) {
        this.outcome = outcome;
    }
}
