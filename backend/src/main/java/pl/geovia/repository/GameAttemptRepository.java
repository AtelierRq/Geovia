package pl.geovia.repository;

import pl.geovia.entity.GameAttempt;
import pl.geovia.entity.enums.AttemptType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameAttemptRepository
        extends JpaRepository<GameAttempt, UUID> {

    List<GameAttempt> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<GameAttempt> findAllByUser_IdAndAttemptTypeOrderByCreatedAtDesc(
            UUID userId,
            AttemptType attemptType
    );

    List<GameAttempt> findAllByChallenge_Id(UUID challengeId);

    long countByUser_Id(UUID userId);
}
