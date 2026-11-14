package pl.geovia.entity;

import pl.geovia.entity.enums.AttemptType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class AttemptTypeConverter
        implements AttributeConverter<AttemptType, String> {

    @Override
    public String convertToDatabaseColumn(AttemptType type) {
        return type == null
                ? null
                : type.name().toLowerCase();
    }

    @Override
    public AttemptType convertToEntityAttribute(String value) {
        return value == null
                ? null
                : AttemptType.valueOf(value.toUpperCase());
    }
}
