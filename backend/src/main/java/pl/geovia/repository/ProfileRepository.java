package pl.geovia.repository;

import pl.geovia.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    Optional<Profile> findByAccount_Id(UUID accountId);
    boolean existsByIdAndAccount_Id(UUID id, UUID accountId);
}
