package pl.geovia.dto;

public record CountryKnowledgeItemResponse(
        String countryId,
        String nameStatus,
        String capitalStatus,
        String flagStatus,
        String overallStatus,
        int nameEvidence,
        int capitalEvidence,
        int flagEvidence
) {}
