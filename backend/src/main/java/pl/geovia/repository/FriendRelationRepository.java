package pl.geovia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.geovia.entity.FriendRelation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendRelationRepository extends JpaRepository<FriendRelation, UUID> {
    @Query("select relation from FriendRelation relation where relation.status = :status and (relation.requester.id = :profileId or relation.recipient.id = :profileId) order by relation.createdAt desc")
    List<FriendRelation> findAllForProfile(@Param("profileId") UUID profileId, @Param("status") String status);

    @Query("select relation from FriendRelation relation where (relation.requester.id = :first and relation.recipient.id = :second) or (relation.requester.id = :second and relation.recipient.id = :first)")
    Optional<FriendRelation> findBetween(@Param("first") UUID first, @Param("second") UUID second);

    Optional<FriendRelation> findByIdAndRecipient_IdAndStatus(UUID id, UUID profileId, String status);
    Optional<FriendRelation> findByIdAndRequester_IdAndStatus(UUID id, UUID profileId, String status);
}
