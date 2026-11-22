package pl.geovia.dto;

import java.util.List;

public record FriendOverviewResponse(List<FriendProfileResponse> friends, List<FriendRequestResponse> incomingRequests, List<FriendRequestResponse> outgoingRequests) {
    public record FriendRequestResponse(String requestId, FriendProfileResponse profile) {}
}
