package pl.geovia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.geovia.entity.AccountSession;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;
import java.time.OffsetDateTime;
import org.springframework.data.repository.query.Param;

public interface AccountSessionRepository extends JpaRepository<AccountSession, UUID> {
    @Query(value = "SELECT account_id FROM account_sessions WHERE token_hash = :hash AND expires_at > NOW()", nativeQuery = true)
    Optional<UUID> findActiveAccountId(@Param("hash") String hash);
    @Modifying @Query(value = "DELETE FROM account_sessions WHERE token_hash = :hash", nativeQuery = true)
    void deleteByTokenHash(@Param("hash") String hash);
    @Modifying @Query(value = "DELETE FROM account_sessions WHERE account_id = :accountId AND token_hash <> :currentHash", nativeQuery = true)
    void deleteOtherSessions(@Param("accountId") UUID accountId, @Param("currentHash") String currentHash);
    java.util.List<AccountSession> findAllByAccountIdAndExpiresAtAfterOrderByCreatedAtDesc(UUID accountId, OffsetDateTime now);
    java.util.Optional<AccountSession> findByIdAndAccountId(UUID id, UUID accountId);
    @Modifying @Query(value="DELETE FROM account_sessions WHERE id = :id AND account_id = :accountId", nativeQuery=true)
    int deleteOwnedSession(@Param("id") UUID id, @Param("accountId") UUID accountId);
    @Modifying @Query(value="DELETE FROM account_sessions WHERE account_id = :accountId", nativeQuery=true)
    void deleteAllForAccount(@Param("accountId") UUID accountId);
    @Modifying @Query(value="DELETE FROM account_sessions WHERE expires_at <= NOW()", nativeQuery=true)
    void deleteExpired();
}
