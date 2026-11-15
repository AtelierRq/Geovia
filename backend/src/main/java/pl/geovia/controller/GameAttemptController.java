package pl.geovia.controller;

import jakarta.validation.Valid;
import pl.geovia.dto.CreateGameAttemptRequest;
import pl.geovia.dto.QuizAttemptResponse;
import pl.geovia.service.GameAttemptService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/attempts")
public class GameAttemptController {
    private final GameAttemptService gameAttemptService;

    public GameAttemptController(GameAttemptService gameAttemptService) {
        this.gameAttemptService = gameAttemptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuizAttemptResponse createAttempt(@Valid @RequestBody CreateGameAttemptRequest request) {
        return gameAttemptService.createAttempt(request);
    }
}
