package pl.geovia.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DailyChallengeGenerator {
    public static final int QUESTION_COUNT = 5;
    public static final int TIME_LIMIT_SECONDS = 30;
    public static final String ALGORITHM_VERSION = "lcg-1.0";

    private final ObjectMapper objectMapper;
    private final List<CapitalEntry> capitals;

    public DailyChallengeGenerator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        try {
            JsonNode data = objectMapper.readTree(new ClassPathResource("data/capitals.json").getInputStream());
            this.capitals = new ArrayList<>();
            for (JsonNode item : data) {
                capitals.add(new CapitalEntry(
                        item.get("countryId").asText(),
                        item.get("country").asText(),
                        item.get("capital").asText()
                ));
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot load capitals dataset", exception);
        }
        if (capitals.size() < QUESTION_COUNT + 3) {
            throw new IllegalStateException("Not enough capitals to generate daily challenge");
        }
    }

    public long seedFor(LocalDate date) {
        return Long.parseLong(date.toString().replace("-", ""));
    }

    public JsonNode generateQuestions(LocalDate date) {
        JsRandom random = new JsRandom(seedFor(date));
        List<CapitalEntry> pool = new ArrayList<>(capitals);
        shuffle(pool, random);

        ArrayNode questions = objectMapper.createArrayNode();
        for (int i = 0; i < QUESTION_COUNT; i++) {
            CapitalEntry selected = pool.get(i);
            List<String> distractors = capitals.stream()
                    .filter(candidate -> !candidate.capital().equals(selected.capital()))
                    .map(CapitalEntry::capital)
                    .distinct()
                    .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
            shuffle(distractors, random);
            List<String> options = new ArrayList<>(distractors.subList(0, 3));
            options.add(selected.capital());
            shuffle(options, random);

            ObjectNode question = objectMapper.createObjectNode();
            question.put("countryId", selected.countryId());
            question.put("country", selected.country());
            question.put("answer", selected.capital());
            ArrayNode optionArray = question.putArray("options");
            options.forEach(optionArray::add);
            questions.add(question);
        }
        return questions;
    }

    private static <T> void shuffle(List<T> items, JsRandom random) {
        for (int index = items.size() - 1; index > 0; index--) {
            int swapIndex = (int) Math.floor(random.nextDouble() * (index + 1));
            T value = items.get(index);
            items.set(index, items.get(swapIndex));
            items.set(swapIndex, value);
        }
    }

    private record CapitalEntry(String countryId, String country, String capital) {}

    // Matches the frontend's 32-bit JavaScript LCG exactly.
    private static final class JsRandom {
        private long value;
        private JsRandom(long seed) { this.value = seed & 0xffff_ffffL; }
        private double nextDouble() {
            value = (value * 1664525L + 1013904223L) & 0xffff_ffffL;
            return value / 4294967296.0;
        }
    }
}
