package pl.geovia.entity;

import pl.geovia.entity.enums.GuestImportStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class GuestImportStatusConverter
        implements AttributeConverter<GuestImportStatus, String> {

    @Override
    public String convertToDatabaseColumn(GuestImportStatus status) {
        return status == null
                ? null
                : switch (status) {
            case PENDING -> "pending";
            case IMPORTED -> "imported";
            case SKIPPED -> "skipped";
            case NO_DATA -> "no_data";
        };
    }

    @Override
    public GuestImportStatus convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }

        return switch (value) {
            case "pending" -> GuestImportStatus.PENDING;
            case "imported" -> GuestImportStatus.IMPORTED;
            case "skipped" -> GuestImportStatus.SKIPPED;
            case "no_data" -> GuestImportStatus.NO_DATA;
            default -> throw new IllegalArgumentException(
                    "Unknown guest import status: " + value
            );
        };
    }
}
