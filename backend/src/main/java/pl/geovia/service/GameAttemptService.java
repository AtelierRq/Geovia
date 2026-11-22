package pl.geovia.service;

import pl.geovia.dto.*;
import pl.geovia.entity.GameAttempt;
import pl.geovia.entity.GameAttemptCountryResult;
import pl.geovia.entity.Profile;
import pl.geovia.entity.enums.AttemptStatus;
import pl.geovia.entity.enums.AttemptType;
import pl.geovia.entity.enums.CountryResultOutcome;
import pl.geovia.repository.GameAttemptCountryResultRepository;
import pl.geovia.repository.GameAttemptRepository;
import pl.geovia.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class GameAttemptService {
    private final GameAttemptRepository attemptRepository;
    private final GameAttemptCountryResultRepository countryResultRepository;
    private final ProfileRepository profileRepository;

    public GameAttemptService(
            GameAttemptRepository attemptRepository,
            GameAttemptCountryResultRepository countryResultRepository,
            ProfileRepository profileRepository
    ) {
        this.attemptRepository = attemptRepository;
        this.countryResultRepository = countryResultRepository;
        this.profileRepository = profileRepository;
    }

    public QuizAttemptResponse createAttempt(CreateGameAttemptRequest request) {
        Profile profile = profileRepository.findById(request.profileId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        if (request.finishedAt().isBefore(request.startedAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "finishedAt must not be before startedAt");
        }
        long measuredDuration = Duration.between(request.startedAt(), request.finishedAt()).toMillis();
        if (Math.abs(measuredDuration - request.durationMs()) > 60_000L) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration does not match the supplied timestamps");
        }

        if (request.correctCount() > request.totalQuestions()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correct answers cannot exceed total questions");
        }

        Set<String> countryIds = new HashSet<>();
        int countryCorrect = 0;
        List<CountryResultRequest> normalizedResults = new ArrayList<>();
        List<CountryResultRequest> submittedResults = request.countryResults() == null
                ? List.of()
                : request.countryResults();
        for (CountryResultRequest result : submittedResults) {
            if (!countryIds.add(result.countryId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country results must not contain duplicate country IDs");
            }
            CountryResultOutcome outcome = parseOutcome(result.outcome());
            if (outcome == CountryResultOutcome.CORRECT) countryCorrect++;
            normalizedResults.add(new CountryResultRequest(result.countryId(), outcome.name().toLowerCase(Locale.ROOT)));
        }

        if (!normalizedResults.isEmpty() && countryCorrect != request.correctCount()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country results do not match correctCount");
        }
        if (!normalizedResults.isEmpty()
                && Set.of("countries", "capitals", "flags").contains(request.categoryId())
                && normalizedResults.size() != request.totalQuestions()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country results must cover the full quiz scope");
        }

        int total = request.totalQuestions();
        int correct = request.correctCount();
        GameAttempt attempt = new GameAttempt();
        attempt.setUser(profile);
        attempt.setAttemptType(AttemptType.QUIZ);
        attempt.setCategoryId(request.categoryId());
        attempt.setAreaId(request.areaId());
        attempt.setModeId(request.modeId());
        attempt.setCorrectCount(correct);
        attempt.setTotalQuestions(total);
        attempt.setScorePercent(BigDecimal.valueOf(correct * 100.0 / total).setScale(2, RoundingMode.HALF_UP));
        attempt.setDurationMs(request.durationMs());
        attempt.setStatus(parseStatus(request.status()));
        attempt.setStartedAt(request.startedAt());
        attempt.setFinishedAt(request.finishedAt());

        GameAttempt saved = attemptRepository.saveAndFlush(attempt);
        List<GameAttemptCountryResult> countryResults = normalizedResults.stream()
                .map(result -> new GameAttemptCountryResult(
                        saved,
                        result.countryId(),
                        parseOutcome(result.outcome())
                ))
                .toList();
        countryResultRepository.saveAll(countryResults);
        return toResponse(saved, normalizedResults);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getHistory(UUID profileId) {
        requireProfile(profileId);
        return attemptRepository.findAllByUser_IdAndAttemptTypeOrderByCreatedAtDesc(profileId, AttemptType.QUIZ)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProfileStatsResponse getStats(UUID profileId) {
        requireProfile(profileId);
        List<GameAttempt> attempts = attemptRepository
                .findAllByUser_IdAndAttemptTypeOrderByCreatedAtDesc(profileId, AttemptType.QUIZ);
        OffsetDateTime since = OffsetDateTime.now().minusDays(30);
        long recent = attempts.stream().filter(a -> !a.getFinishedAt().isBefore(since)).count();
        long correct = attempts.stream().mapToLong(GameAttempt::getCorrectCount).sum();
        BigDecimal average = attempts.isEmpty()
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : attempts.stream().map(GameAttempt::getScorePercent)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(attempts.size()), 2, RoundingMode.HALF_UP);
        return new ProfileStatsResponse(
                attempts.size(),
                recent,
                correct,
                average,
                attempts.isEmpty() ? null : attempts.getFirst().getFinishedAt()
        );
    }

    @Transactional(readOnly = true)
    public PublicProfileActivityResponse getPublicActivity(UUID profileId) {
        requireProfile(profileId);
        List<GameAttempt> attempts = attemptRepository
                .findAllByUser_IdAndAttemptTypeOrderByCreatedAtDesc(profileId, AttemptType.QUIZ);
        OffsetDateTime since = OffsetDateTime.now().minusDays(30);
        long recent = attempts.stream().filter(a -> !a.getFinishedAt().isBefore(since)).count();
        long correct = attempts.stream().mapToLong(GameAttempt::getCorrectCount).sum();
        BigDecimal average = attempts.isEmpty()
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : attempts.stream().map(GameAttempt::getScorePercent)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(attempts.size()), 2, RoundingMode.HALF_UP);
        GameAttempt last = attempts.isEmpty() ? null : attempts.getFirst();
        return new PublicProfileActivityResponse(attempts.size(), recent, correct, average,
                last == null ? null : last.getFinishedAt(), last == null ? null : last.getCategoryId(),
                last == null ? null : last.getScorePercent());
    }

    @Transactional(readOnly = true)
    public CountryKnowledgeResponse getCountryKnowledge(UUID profileId) {
        requireProfile(profileId);
        List<GameAttempt> attempts = attemptRepository
                .findAllByUser_IdAndAttemptTypeOrderByCreatedAtAsc(profileId, AttemptType.QUIZ);
        Map<String, CountryEvidence> evidence = new LinkedHashMap<>();

        for (GameAttempt attempt : attempts) {
            String element = switch (attempt.getCategoryId()) {
                case "countries" -> "name";
                case "capitals" -> "capital";
                case "flags" -> "flag";
                default -> null;
            };
            if (element == null) continue;
            List<GameAttemptCountryResult> results = countryResultRepository.findAllById_AttemptId(attempt.getId());
            for (GameAttemptCountryResult result : results) {
                CountryEvidence country = evidence.computeIfAbsent(result.getCountryId(), ignored -> new CountryEvidence());
                boolean correct = result.getOutcome() == CountryResultOutcome.CORRECT;
                switch (element) {
                    case "name" -> country.name.add(correct);
                    case "capital" -> country.capital.add(correct);
                    case "flag" -> country.flag.add(correct);
                }
            }
        }

        List<CountryKnowledgeItemResponse> response = evidence.entrySet().stream()
                .map(entry -> {
                    CountryEvidence item = entry.getValue();
                    String name = knowledgeStatus(item.name);
                    String capital = knowledgeStatus(item.capital);
                    String flag = knowledgeStatus(item.flag);
                    String overall = overallStatus(name, capital, flag);
                    return new CountryKnowledgeItemResponse(
                            entry.getKey(), name, capital, flag, overall,
                            item.name.size(), item.capital.size(), item.flag.size()
                    );
                }).toList();
        return new CountryKnowledgeResponse(response);
    }

    private void requireProfile(UUID profileId) {
        if (!profileRepository.existsById(profileId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }
    }

    private QuizAttemptResponse toResponse(GameAttempt attempt) {
        List<CountryResultRequest> results = countryResultRepository.findAllById_AttemptId(attempt.getId())
                .stream()
                .map(result -> new CountryResultRequest(
                        result.getCountryId(),
                        result.getOutcome().name().toLowerCase(Locale.ROOT)
                )).toList();
        return toResponse(attempt, results);
    }

    private QuizAttemptResponse toResponse(GameAttempt attempt, List<CountryResultRequest> results) {
        return new QuizAttemptResponse(
                attempt.getId(), attempt.getCategoryId(), attempt.getAreaId(), attempt.getModeId(),
                attempt.getCorrectCount(), attempt.getTotalQuestions(), attempt.getScorePercent(),
                attempt.getDurationMs(), attempt.getStatus().name().toLowerCase(Locale.ROOT).replace('_', '-'),
                attempt.getStartedAt(), attempt.getFinishedAt(), results
        );
    }

    private static AttemptStatus parseStatus(String value) {
        return switch (value) {
            case "completed" -> AttemptStatus.COMPLETED;
            case "ended-early" -> AttemptStatus.ENDED_EARLY;
            case "time-expired" -> AttemptStatus.TIME_EXPIRED;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported attempt status");
        };
    }

    private static CountryResultOutcome parseOutcome(String value) {
        try {
            return CountryResultOutcome.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported country result outcome");
        }
    }

    private static String knowledgeStatus(List<Boolean> outcomes) {
        if (outcomes.size() < 3) return "unknown";
        List<Boolean> last = outcomes.subList(Math.max(0, outcomes.size() - 3), outcomes.size());
        long correct = last.stream().filter(Boolean::booleanValue).count();
        if (correct == 3) return "mastered";
        if (correct == 0) return "needs-work";
        return "learning";
    }

    private static String overallStatus(String name, String capital, String flag) {
        List<String> statuses = List.of(name, capital, flag);
        if (statuses.stream().allMatch("unknown"::equals)) return "unknown";
        if (statuses.stream().allMatch("mastered"::equals)) return "mastered";
        if (statuses.contains("mastered")) return "learning";
        return "needs-work";
    }

    private static final class CountryEvidence {
        private final List<Boolean> name = new ArrayList<>();
        private final List<Boolean> capital = new ArrayList<>();
        private final List<Boolean> flag = new ArrayList<>();
    }
}
