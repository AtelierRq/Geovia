package pl.geovia.entity;

import pl.geovia.entity.enums.DailyChallengeStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class DailyChallengeStatusConverter
        implements AttributeConverter<DailyChallengeStatus, String> {

    @Override
    public String convertToDatabaseColumn(DailyChallengeStatus status) {
        return status == null ? null : status.name().toLowerCase();
    }

    @Override
    public DailyChallengeStatus convertToEntityAttribute(String value) {
        return value == null
                ? null
                : DailyChallengeStatus.valueOf(value.toUpperCase());
    }
}
