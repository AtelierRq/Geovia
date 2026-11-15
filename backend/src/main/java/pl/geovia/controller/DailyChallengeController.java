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
            @PathVariable UUID challengeId,
            @Valid @RequestBody StartDailyChallengeAttemptRequest request
    ) {
        return dailyChallengeService.startAttempt(challengeId, request);
    }

    @PostMapping("/attempts/{sessionId}/finish")
    public GameAttemptResponse finishAttempt(
            @PathVariable UUID sessionId,
            @Valid @RequestBody FinishDailyChallengeAttemptRequest request
    ) {
        return dailyChallengeService.finishAttempt(sessionId, request);
    }

    @GetMapping("/history")
    public DailyChallengeHistoryResponse getHistory(@RequestParam UUID profileId) {
        return dailyChallengeService.getHistory(profileId);
    }

    @GetMapping("/{challengeId}/best-result")
    public GameAttemptResponse getBestResult(
            @PathVariable UUID challengeId,
            @RequestParam UUID profileId
    ) {
        return dailyChallengeService.getBestResult(challengeId, profileId);
    }
}
