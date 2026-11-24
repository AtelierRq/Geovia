package pl.geovia.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Component
public class QuizAnswerBank {
    private static final Pattern MARKS = Pattern.compile("\\p{M}+");
    private final Map<String, Entry> entries;

    public QuizAnswerBank(ObjectMapper mapper) {
        try {
            List<Entry> loaded = mapper.readValue(new ClassPathResource("data/quiz-answers.json").getInputStream(), new TypeReference<>() {});
            this.entries = loaded.stream().collect(java.util.stream.Collectors.toUnmodifiableMap(Entry::id, entry -> entry));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not load trusted quiz answer data", exception);
        }
    }

    public List<Entry> scope(String categoryId, String areaId, String modeId) {
        boolean supported = switch (categoryId) {
            case "countries" -> modeId.equals("type-to-map");
            case "capitals" -> modeId.equals("type-capital");
            case "flags" -> modeId.equals("name-flag");
            default -> false;
        };
        if (!supported) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported quiz type");
        if (!areaId.equals("world") && !Set.of("africa", "asia", "europe", "north-america", "south-america", "oceania").contains(areaId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported quiz area");
        }
        if (!categoryId.equals("countries") && !areaId.equals("world")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This quiz is only available worldwide");
        }
        return entries.values().stream()
                .filter(entry -> areaId.equals("world") || entry.continents().contains(areaId))
                .filter(entry -> !categoryId.equals("capitals") || entry.capital() != null)
                .sorted(Comparator.comparing(Entry::id))
                .toList();
    }

    public boolean isCorrect(Entry entry, String categoryId, String answer) {
        List<String> accepted = switch (categoryId) {
            case "countries", "flags" -> concat(entry.name(), entry.aliases());
            case "capitals" -> entry.capital() == null ? List.of() : concat(entry.capital().name(), entry.capital().aliases());
            default -> List.of();
        };
        String normalized = normalize(answer);
        return !normalized.isEmpty() && accepted.stream().map(QuizAnswerBank::normalize).anyMatch(normalized::equals);
    }

    public static String normalize(String value) {
        String decomposed = Normalizer.normalize(value.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        return MARKS.matcher(decomposed).replaceAll("").replace('ł', 'l').replaceAll("[^a-z0-9]", "");
    }

    private static List<String> concat(String name, List<String> aliases) {
        List<String> values = new ArrayList<>();
        values.add(name);
        if (aliases != null) values.addAll(aliases);
        return values;
    }

    public record Entry(String id, String name, List<String> aliases, List<String> continents, Capital capital) {}
    public record Capital(String name, List<String> aliases) {}
}
