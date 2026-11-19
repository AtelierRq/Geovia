package pl.geovia.controller;

import jakarta.validation.Valid;
import pl.geovia.dto.CreateGameAttemptRequest;
import pl.geovia.dto.QuizAttemptResponse;
import pl.geovia.service.GameAttemptService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import pl.geovia.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/attempts")
public class GameAttemptController {
    private final GameAttemptService gameAttemptService;
    private final ProfileRepository profiles;

    public GameAttemptController(GameAttemptService gameAttemptService, ProfileRepository profiles) {
        this.gameAttemptService = gameAttemptService;
        this.profiles = profiles;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuizAttemptResponse createAttempt(@RequestAttribute("accountId") UUID accountId, @Valid @RequestBody CreateGameAttemptRequest request) {
        if (!profiles.existsByIdAndAccount_Id(request.profileId(), accountId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Profile does not belong to this account");
        return gameAttemptService.createAttempt(request);
    }
}
