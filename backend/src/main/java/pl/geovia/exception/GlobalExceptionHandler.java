package pl.geovia.exception;

import jakarta.servlet.http.HttpServletRequest;

import pl.geovia.dto.ApiErrorResponse;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        Map<String, String> validationErrors =
                exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .collect(Collectors.toMap(
                                error -> error.getField(),
                                error -> error.getDefaultMessage(),
                                (first, second) -> first
                        ));

        return createError(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                request,
                validationErrors
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {

        HttpStatusCode statusCode = exception.getStatusCode();

        HttpStatus status = HttpStatus.resolve(statusCode.value());

        String error = status != null
                ? status.getReasonPhrase()
                : "HTTP Error";

        String message = exception.getReason() != null
                ? exception.getReason()
                : error;

        return createError(
                statusCode,
                error,
                message,
                request,
                Map.of()
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidJson(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {

        return createError(
                HttpStatus.BAD_REQUEST,
                "Invalid JSON request body",
                request,
                Map.of()
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {

        return createError(
                HttpStatus.CONFLICT,
                "The request conflicts with existing data",
                request,
                Map.of()
        );
    }

    private ResponseEntity<ApiErrorResponse> createError(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> validationErrors
    ) {

        return createError(
                status,
                status.getReasonPhrase(),
                message,
                request,
                validationErrors
        );
    }

    private ResponseEntity<ApiErrorResponse> createError(
            HttpStatusCode statusCode,
            String error,
            String message,
            HttpServletRequest request,
            Map<String, String> validationErrors
    ) {

        ApiErrorResponse response = new ApiErrorResponse(
                OffsetDateTime.now(),
                statusCode.value(),
                error,
                message,
                request.getRequestURI(),
                validationErrors
        );

        return ResponseEntity
                .status(statusCode)
                .body(response);
    }
}
