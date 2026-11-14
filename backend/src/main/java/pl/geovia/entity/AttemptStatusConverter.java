package pl.geovia.entity;

import pl.geovia.entity.enums.AttemptStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class AttemptStatusConverter
        implements AttributeConverter<AttemptStatus, String> {

    @Override
    public String convertToDatabaseColumn(AttemptStatus status) {
        return status == null
                ? null
                : status.name().toLowerCase();
    }

    @Override
    public AttemptStatus convertToEntityAttribute(String value) {
        return value == null
                ? null
                : AttemptStatus.valueOf(value.toUpperCase());
    }
}
