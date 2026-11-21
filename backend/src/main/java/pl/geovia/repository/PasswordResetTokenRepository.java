package pl.geovia.repository;

import pl.geovia.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    void deleteAllByAccountId(UUID accountId);
    @Modifying @Query(value="DELETE FROM account_password_reset_tokens WHERE token_hash = :hash", nativeQuery=true)
    int consumeByTokenHash(@Param("hash") String hash);
}
