package pl.geovia.entity;

import pl.geovia.entity.enums.CountryResultOutcome;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class CountryResultOutcomeConverter
        implements AttributeConverter<CountryResultOutcome, String> {

    @Override
    public String convertToDatabaseColumn(CountryResultOutcome outcome) {
        return outcome == null
                ? null
                : outcome.name().toLowerCase();
    }

    @Override
    public CountryResultOutcome convertToEntityAttribute(String value) {
        return value == null
                ? null
                : CountryResultOutcome.valueOf(value.toUpperCase());
    }
}
