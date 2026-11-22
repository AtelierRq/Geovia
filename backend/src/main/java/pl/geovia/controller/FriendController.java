package pl.geovia.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pl.geovia.dto.FriendOverviewResponse;
import pl.geovia.dto.FriendRequestCreateRequest;
import pl.geovia.dto.FriendSearchResultResponse;
import pl.geovia.service.FriendService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendController {
    private final FriendService friends;
    public FriendController(FriendService friends) { this.friends = friends; }

    @GetMapping
    public FriendOverviewResponse getOverview(@RequestAttribute("accountId") UUID accountId) { return friends.getOverview(accountId); }

    @GetMapping("/search")
    public List<FriendSearchResultResponse> search(@RequestAttribute("accountId") UUID accountId, @RequestParam(required = false) String q) {
        return friends.search(accountId, q);
    }

    @PostMapping("/requests") @ResponseStatus(HttpStatus.CREATED)
    public void sendRequest(@RequestAttribute("accountId") UUID accountId, @Valid @RequestBody FriendRequestCreateRequest request) {
        friends.sendRequest(accountId, request);
    }

    @PostMapping("/requests/{requestId}/accept") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void accept(@RequestAttribute("accountId") UUID accountId, @PathVariable UUID requestId) { friends.accept(accountId, requestId); }

    @DeleteMapping("/requests/{requestId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void decline(@RequestAttribute("accountId") UUID accountId, @PathVariable UUID requestId) { friends.decline(accountId, requestId); }

    @DeleteMapping("/requests/{requestId}/outgoing") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@RequestAttribute("accountId") UUID accountId, @PathVariable UUID requestId) { friends.cancel(accountId, requestId); }

    @DeleteMapping("/{profileId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFriend(@RequestAttribute("accountId") UUID accountId, @PathVariable UUID profileId) { friends.removeFriend(accountId, profileId); }
}
