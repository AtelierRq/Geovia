package pl.geovia.service;

import pl.geovia.dto.*;
import pl.geovia.entity.*;
import pl.geovia.entity.enums.AttemptStatus;
import pl.geovia.entity.enums.AttemptType;
import pl.geovia.entity.enums.DailyChallengeStatus;
import pl.geovia.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;

@Service
@Transactional
public class DailyChallengeService {
    private static final ZoneId CHALLENGE_ZONE = ZoneId.of("Europe/Warsaw");

    private final DailyChallengeRepository challengeRepository;
    private final ProfileRepository profileRepository;
    private final GameAttemptRepository attemptRepository;
    private final DailyChallengeAttemptSessionRepository sessionRepository;
    private final DailyChallengeGenerator generator;

    public DailyChallengeService(
            DailyChallengeRepository challengeRepository,
            ProfileRepository profileRepository,
            GameAttemptRepository attemptRepository,
            DailyChallengeAttemptSessionRepository sessionRepository,
            DailyChallengeGenerator generator
    ) {
        this.challengeRepository = challengeRepository;
        this.profileRepository = profileRepository;
        this.attemptRepository = attemptRepository;
        this.sessionRepository = sessionRepository;
        this.generator = generator;
    }

    @Transactional(readOnly = true)
    public DailyChallengeResponse getToday() {
        LocalDate today = LocalDate.now(CHALLENGE_ZONE);
        DailyChallenge challenge = challengeRepository
                .findByChallengeDateAndStatus(today, DailyChallengeStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Today's challenge is not available"));
        return toChallengeResponse(challenge);
    }

    public DailyChallengeResponse ensureTodayExists() {
        LocalDate today = LocalDate.now(CHALLENGE_ZONE);
        DailyChallenge challenge = challengeRepository.findByChallengeDate(today)
                .orElseGet(() -> createPublishedChallenge(today));
        if (challenge.getStatus() != DailyChallengeStatus.PUBLISHED) {
            challenge.setStatus(DailyChallengeStatus.PUBLISHED);
            challenge.setPublishedAt(OffsetDateTime.now(CHALLENGE_ZONE));
            challenge = challengeRepository.save(challenge);
        }
        return toChallengeResponse(challenge);
    }

    @Transactional(readOnly = true)
    public boolean ownsProfile(UUID profileId, UUID accountId) {
        return profileRepository.existsByIdAndAccount_Id(profileId, accountId);
    }

    @Transactional(readOnly = true)
    public boolean ownsSession(UUID sessionId, UUID accountId) {
        return sessionRepository.findById(sessionId)
                .map(session -> session.getUser().getAccount() != null && accountId.equals(session.getUser().getAccount().getId()))
                .orElse(false);
    }

    private DailyChallenge createPublishedChallenge(LocalDate date) {
        DailyChallenge challenge = new DailyChallenge();
        challenge.setChallengeDate(date);
        challenge.setTimezoneId(CHALLENGE_ZONE.getId());
        challenge.setTitle("Stolica w 30 sekund");
        challenge.setCategoryId("capitals");
        challenge.setAreaId("world");
        challenge.setModeId("multiple-choice");
        challenge.setQuestionCount(DailyChallengeGenerator.QUESTION_COUNT);
        challenge.setTimeLimitSeconds(DailyChallengeGenerator.TIME_LIMIT_SECONDS);
        challenge.setSeed(generator.seedFor(date));
        challenge.setAlgorithmVersion(DailyChallengeGenerator.ALGORITHM_VERSION);
        challenge.setQuestions(generator.generateQuestions(date));
        challenge.setStatus(DailyChallengeStatus.PUBLISHED);
        challenge.setPublishedAt(OffsetDateTime.now(CHALLENGE_ZONE));
        return challengeRepository.save(challenge);
    }

    public StartDailyChallengeAttemptResponse startAttempt(UUID challengeId, StartDailyChallengeAttemptRequest request) {
        DailyChallenge challenge = challengeRepository.findById(challengeId)
                .filter(item -> item.getStatus() == DailyChallengeStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Published challenge not found"));
        Profile profile = profileRepository.findById(request.profileId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        OffsetDateTime now = OffsetDateTime.now(CHALLENGE_ZONE);
        DailyChallengeAttemptSession session = sessionRepository.save(
                new DailyChallengeAttemptSession(profile, challenge, now)
        );
        return new StartDailyChallengeAttemptResponse(
                session.getId(), session.getStartedAt(), challenge.getTimeLimitSeconds()
        );
    }

    public CheckDailyChallengeAnswerResponse checkAnswer(
            UUID sessionId,
            CheckDailyChallengeAnswerRequest request
    ) {
        DailyChallengeAttemptSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt session not found"));
        if (session.getConsumedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This attempt has already been submitted");
        }

        JsonNode questions = session.getChallenge().getQuestions();
        if (request.questionIndex() < 0 || request.questionIndex() >= questions.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question index is out of range");
        }

        JsonNode question = questions.get(request.questionIndex());
        boolean validOption = false;
        for (JsonNode option : question.get("options")) {
            if (option.asText().equals(request.answer())) {
                validOption = true;
                break;
            }
        }
        if (!validOption) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submitted answer is not a valid option");
        }

        String correctAnswer = question.get("answer").asText();
        return new CheckDailyChallengeAnswerResponse(
                correctAnswer.equals(request.answer()),
                correctAnswer
        );
    }

    public GameAttemptResponse finishAttempt(UUID sessionId, FinishDailyChallengeAttemptRequest request) {
        DailyChallengeAttemptSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt session not found"));
        if (session.getConsumedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This attempt has already been submitted");
        }

        DailyChallenge challenge = session.getChallenge();
        long wallElapsedMs = Math.max(0, Duration.between(session.getStartedAt(), OffsetDateTime.now(CHALLENGE_ZONE)).toMillis());
        long limitMs = challenge.getTimeLimitSeconds() * 1000L;
        int answeredCount = (int) request.answers().stream().filter(answer -> answer != null && !answer.isEmpty()).count();
        // The original quiz pauses its clock while answer feedback is displayed.
        // Cap client-reported pause time to 1.5 seconds per answered question.
        long allowedPauseMs = Math.min(request.pausedDurationMs(), answeredCount * 1500L);
        long elapsedMs = Math.max(0, wallElapsedMs - allowedPauseMs);
        int correct = 0;
        JsonNode questions = challenge.getQuestions();

        for (int i = 0; i < challenge.getQuestionCount(); i++) {
            String submitted = i < request.answers().size() ? request.answers().get(i) : "";
            JsonNode question = questions.get(i);
            boolean validOption = false;
            for (JsonNode option : question.get("options")) {
                if (option.asText().equals(submitted)) {
                    validOption = true;
                    break;
                }
            }
            if (!validOption && !submitted.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submitted answer is not a valid option");
            }
            if (validOption && question.get("answer").asText().equals(submitted)) correct++;
        }

        AttemptStatus status = elapsedMs > limitMs
                ? AttemptStatus.TIME_EXPIRED
                : AttemptStatus.COMPLETED;

        GameAttempt attempt = new GameAttempt();
        attempt.setUser(session.getUser());
        attempt.setAttemptType(AttemptType.DAILY_CHALLENGE);
        attempt.setCategoryId(challenge.getCategoryId());
        attempt.setAreaId(challenge.getAreaId());
        attempt.setModeId(challenge.getModeId());
        attempt.setChallenge(challenge);
        attempt.setCorrectCount(correct);
        attempt.setTotalQuestions(challenge.getQuestionCount());
        attempt.setScorePercent(BigDecimal.valueOf(correct * 100.0 / challenge.getQuestionCount()).setScale(2, RoundingMode.HALF_UP));
        attempt.setDurationMs(Math.min(elapsedMs, limitMs));
        attempt.setStatus(status);
        attempt.setStartedAt(session.getStartedAt());
        attempt.setFinishedAt(OffsetDateTime.now(CHALLENGE_ZONE));
        GameAttempt saved = attemptRepository.save(attempt);

        session.setConsumedAt(OffsetDateTime.now(CHALLENGE_ZONE));
        sessionRepository.save(session);
        return toAttemptResponse(saved);
    }

    @Transactional(readOnly = true)
    public DailyChallengeHistoryResponse getHistory(UUID profileId) {
        if (!profileRepository.existsById(profileId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }
        List<GameAttempt> attempts = attemptRepository.findAllByUser_IdAndAttemptTypeOrderByCreatedAtDesc(
                profileId, AttemptType.DAILY_CHALLENGE
        );
        List<GameAttemptResponse> responses = attempts.stream().map(this::toAttemptResponse).toList();
        GameAttemptResponse best = attempts.stream()
                .max(Comparator.comparing(GameAttempt::getCorrectCount)
                        .thenComparing(attempt -> -attempt.getDurationMs()))
                .map(this::toAttemptResponse)
                .orElse(null);
        return new DailyChallengeHistoryResponse(responses, best);
    }

    @Transactional(readOnly = true)
    public GameAttemptResponse getBestResult(UUID challengeId, UUID profileId) {
        List<GameAttempt> attempts = attemptRepository
                .findAllByUser_IdAndAttemptTypeAndChallenge_IdOrderByCreatedAtDesc(
                        profileId, AttemptType.DAILY_CHALLENGE, challengeId
                );
        return attempts.stream()
                .max(Comparator.comparing(GameAttempt::getCorrectCount)
                        .thenComparing(attempt -> -attempt.getDurationMs()))
                .map(this::toAttemptResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No attempts found"));
    }

    private DailyChallengeResponse toChallengeResponse(DailyChallenge challenge) {
        List<DailyChallengeQuestionResponse> questions = new ArrayList<>();
        JsonNode array = challenge.getQuestions();
        for (int i = 0; i < array.size(); i++) {
            JsonNode question = array.get(i);
            List<String> options = new ArrayList<>();
            question.get("options").forEach(option -> options.add(option.asText()));
            questions.add(new DailyChallengeQuestionResponse(i, question.get("country").asText(), options));
        }
        return new DailyChallengeResponse(
                challenge.getId(), challenge.getChallengeDate(), challenge.getTitle(),
                challenge.getQuestionCount(), challenge.getTimeLimitSeconds(), questions
        );
    }

    private GameAttemptResponse toAttemptResponse(GameAttempt attempt) {
        return new GameAttemptResponse(
                attempt.getId(), attempt.getChallenge().getId(), attempt.getCorrectCount(),
                attempt.getTotalQuestions(), attempt.getScorePercent(), attempt.getDurationMs(),
                attempt.getStatus(), attempt.getStartedAt(), attempt.getFinishedAt()
        );
    }
}
