package pl.geovia.repository;

import pl.geovia.entity.DailyChallengeAttemptSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DailyChallengeAttemptSessionRepository
        extends JpaRepository<DailyChallengeAttemptSession, UUID> {}
