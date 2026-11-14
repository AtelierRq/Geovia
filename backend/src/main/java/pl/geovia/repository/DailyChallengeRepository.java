package pl.geovia.repository;

import pl.geovia.entity.DailyChallenge;
import pl.geovia.entity.enums.DailyChallengeStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyChallengeRepository
        extends JpaRepository<DailyChallenge, UUID> {

    Optional<DailyChallenge> findByChallengeDate(LocalDate challengeDate);

    Optional<DailyChallenge> findByChallengeDateAndStatus(
            LocalDate challengeDate,
            DailyChallengeStatus status
    );

    List<DailyChallenge> findAllByStatusOrderByChallengeDateDesc(
            DailyChallengeStatus status
    );

    boolean existsByChallengeDate(LocalDate challengeDate);
}
