package pl.geovia.repository;

import pl.geovia.entity.GameAttemptCountryResult;
import pl.geovia.entity.GameAttemptCountryResultId;
import pl.geovia.entity.enums.CountryResultOutcome;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameAttemptCountryResultRepository
        extends JpaRepository<GameAttemptCountryResult, GameAttemptCountryResultId> {

    List<GameAttemptCountryResult> findAllById_AttemptId(
            java.util.UUID attemptId
    );

    List<GameAttemptCountryResult> findAllById_AttemptIdAndOutcome(
            java.util.UUID attemptId,
            CountryResultOutcome outcome
    );

    boolean existsById_AttemptIdAndId_CountryId(
            java.util.UUID attemptId,
            String countryId
    );

    long countById_AttemptIdAndOutcome(
            java.util.UUID attemptId,
            CountryResultOutcome outcome
    );
}
