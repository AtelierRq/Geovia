package pl.geovia.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.geovia.dto.FriendOverviewResponse;
import pl.geovia.dto.FriendProfileResponse;
import pl.geovia.dto.FriendRequestCreateRequest;
import pl.geovia.dto.FriendSearchResultResponse;
import pl.geovia.entity.FriendRelation;
import pl.geovia.entity.Profile;
import pl.geovia.repository.FriendRelationRepository;
import pl.geovia.repository.ProfileRepository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FriendService {
    private final FriendRelationRepository relations;
    private final ProfileRepository profiles;

    public FriendService(FriendRelationRepository relations, ProfileRepository profiles) {
        this.relations = relations;
        this.profiles = profiles;
    }

    @Transactional(readOnly = true)
    public FriendOverviewResponse getOverview(UUID accountId) {
        Profile me = requireProfile(accountId);
        List<FriendProfileResponse> friends = relations.findAllForProfile(me.getId(), "accepted").stream()
                .map(relation -> summary(relation.getRequester().getId().equals(me.getId()) ? relation.getRecipient() : relation.getRequester(), relation.getCreatedAt()))
                .toList();
        List<FriendOverviewResponse.FriendRequestResponse> incoming = relations.findAllForProfile(me.getId(), "pending").stream()
                .filter(relation -> relation.getRecipient().getId().equals(me.getId()))
                .map(relation -> new FriendOverviewResponse.FriendRequestResponse(relation.getId().toString(), summary(relation.getRequester(), relation.getCreatedAt())))
                .toList();
        List<FriendOverviewResponse.FriendRequestResponse> outgoing = relations.findAllForProfile(me.getId(), "pending").stream()
                .filter(relation -> relation.getRequester().getId().equals(me.getId()))
                .map(relation -> new FriendOverviewResponse.FriendRequestResponse(relation.getId().toString(), summary(relation.getRecipient(), relation.getCreatedAt())))
                .toList();
        return new FriendOverviewResponse(friends, incoming, outgoing);
    }

    @Transactional(readOnly = true)
    public List<FriendSearchResultResponse> search(UUID accountId, String query) {
        Profile me = requireProfile(accountId);
        if (query == null || query.trim().length() < 2) return List.of();
        return profiles.findTop10ByUsernameContainingIgnoreCaseAndAccountIsNotNullOrderByUsernameAsc(query.trim()).stream()
                .filter(profile -> !profile.getId().equals(me.getId()))
                .map(profile -> {
                    String state = relations.findBetween(me.getId(), profile.getId()).map(relation -> {
                        if ("accepted".equals(relation.getStatus())) return "accepted";
                        return relation.getRequester().getId().equals(me.getId()) ? "outgoing-pending" : "incoming-pending";
                    }).orElse("none");
                    return new FriendSearchResultResponse(profile.getId(), profile.getUsername(),
                            publicAvatar(profile), profile.getVisibility(), state);
                }).toList();
    }

    public void sendRequest(UUID accountId, FriendRequestCreateRequest request) {
        Profile me = requireProfile(accountId);
        Profile recipient = profiles.findByUsernameIgnoreCase(request.username().trim())
                .filter(profile -> profile.getAccount() != null)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono takiego użytkownika"));
        if (recipient.getId().equals(me.getId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nie możesz dodać siebie do znajomych");
        FriendRelation existing = relations.findBetween(me.getId(), recipient.getId()).orElse(null);
        if (existing != null) {
            if ("accepted".equals(existing.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ten użytkownik jest już na liście znajomych");
            if (existing.getRequester().getId().equals(me.getId())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Zaproszenie zostało już wysłane");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ten użytkownik wysłał Ci już zaproszenie. Odpowiedz na nie w sekcji zaproszeń");
        }
        relations.saveAndFlush(new FriendRelation(me, recipient));
    }

    public void accept(UUID accountId, UUID requestId) {
        Profile me = requireProfile(accountId);
        FriendRelation relation = relations.findByIdAndRecipient_IdAndStatus(requestId, me.getId(), "pending")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zaproszenie nie istnieje lub nie możesz go zaakceptować"));
        relation.setStatus("accepted");
    }

    public void decline(UUID accountId, UUID requestId) {
        Profile me = requireProfile(accountId);
        FriendRelation relation = relations.findByIdAndRecipient_IdAndStatus(requestId, me.getId(), "pending")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zaproszenie nie istnieje"));
        relations.delete(relation);
    }

    public void cancel(UUID accountId, UUID requestId) {
        Profile me = requireProfile(accountId);
        FriendRelation relation = relations.findByIdAndRequester_IdAndStatus(requestId, me.getId(), "pending")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zaproszenie nie istnieje"));
        relations.delete(relation);
    }

    public void removeFriend(UUID accountId, UUID friendProfileId) {
        Profile me = requireProfile(accountId);
        FriendRelation relation = relations.findBetween(me.getId(), friendProfileId)
                .filter(item -> "accepted".equals(item.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono takiego znajomego"));
        relations.delete(relation);
    }

    private Profile requireProfile(UUID accountId) {
        return profiles.findByAccount_Id(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profil konta nie istnieje"));
    }

    private static FriendProfileResponse summary(Profile profile, java.time.OffsetDateTime requestedAt) {
        boolean isPublic = "public".equals(profile.getVisibility());
        return new FriendProfileResponse(profile.getId(), profile.getUsername(), publicAvatar(profile), profile.getVisibility(),
                isPublic ? profile.getBio() : null, isPublic ? profile.getCity() : null, requestedAt);
    }

    private static String publicAvatar(Profile profile) {
        if (!"public".equals(profile.getVisibility()) || profile.getAvatarUrl() == null) return null;
        if (profile.getAvatarUrl().startsWith("data:image/")) return profile.getAvatarUrl();
        return "/api/public/profiles/" + URLEncoder.encode(profile.getUsername(), StandardCharsets.UTF_8).replace("+", "%20") + "/avatar";
    }
}
