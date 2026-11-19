package pl.geovia.controller;

import jakarta.validation.Valid;
import pl.geovia.dto.*;
import pl.geovia.service.DailyChallengeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/daily-challenges")
public class DailyChallengeController {
    private final DailyChallengeService dailyChallengeService;

    public DailyChallengeController(DailyChallengeService dailyChallengeService) {
        this.dailyChallengeService = dailyChallengeService;
    }

    @GetMapping("/today")
    public DailyChallengeResponse getToday() {
        return dailyChallengeService.ensureTodayExists();
    }

    @PostMapping("/{challengeId}/attempts/start")
    @ResponseStatus(HttpStatus.CREATED)
    public StartDailyChallengeAttemptResponse startAttempt(
            @RequestAttribute("accountId") UUID accountId,
            @PathVariable UUID challengeId,
            @Valid @RequestBody StartDailyChallengeAttemptRequest request
    ) {
        if (!dailyChallengeService.ownsProfile(request.profileId(), accountId)) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Profile does not belong to this account");
        return dailyChallengeService.startAttempt(challengeId, request);
    }

    @PostMapping("/attempts/{sessionId}/answers/check")
    public CheckDailyChallengeAnswerResponse checkAnswer(
            @RequestAttribute("accountId") UUID accountId,
            @PathVariable UUID sessionId,
            @Valid @RequestBody CheckDailyChallengeAnswerRequest request
    ) {
        if (!dailyChallengeService.ownsSession(sessionId, accountId)) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Attempt does not belong to this account");
        return dailyChallengeService.checkAnswer(sessionId, request);
    }

    @PostMapping("/attempts/{sessionId}/finish")
    public GameAttemptResponse finishAttempt(
            @RequestAttribute("accountId") UUID accountId,
            @PathVariable UUID sessionId,
            @Valid @RequestBody FinishDailyChallengeAttemptRequest request
    ) {
        if (!dailyChallengeService.ownsSession(sessionId, accountId)) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Attempt does not belong to this account");
        return dailyChallengeService.finishAttempt(sessionId, request);
    }

    @GetMapping("/history")
    public DailyChallengeHistoryResponse getHistory(@RequestAttribute("accountId") UUID accountId, @RequestParam UUID profileId) {
        if (!dailyChallengeService.ownsProfile(profileId, accountId)) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Profile does not belong to this account");
        return dailyChallengeService.getHistory(profileId);
    }

    @GetMapping("/{challengeId}/best-result")
    public GameAttemptResponse getBestResult(
            @PathVariable UUID challengeId,
            @RequestAttribute("accountId") UUID accountId,
            @RequestParam UUID profileId
    ) {
        if (!dailyChallengeService.ownsProfile(profileId, accountId)) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Profile does not belong to this account");
        return dailyChallengeService.getBestResult(challengeId, profileId);
    }
}
