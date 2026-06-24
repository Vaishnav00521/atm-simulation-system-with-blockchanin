package com.global.atm_blockchain.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Invalid argument: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", true, "message", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", true, "message", "You do not have permission to access this resource."));
    }

    @ExceptionHandler(VelocityLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handleVelocityLimit(VelocityLimitExceededException ex) {
        log.warn("Velocity limit breach: {}", ex.getMessage());
        return ResponseEntity.status(429)
                .body(Map.of(
                        "error", true,
                        "type", "VELOCITY_LIMIT_EXCEEDED",
                        "message", ex.getMessage(),
                        "dailyUsed",   ex.getDailyUsed(),
                        "dailyLimit",  ex.getDailyLimit(),
                        "weeklyUsed",  ex.getWeeklyUsed(),
                        "weeklyLimit", ex.getWeeklyLimit(),
                        "currency",    ex.getCurrency()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", true, "message", "An unexpected error occurred: " + ex.getMessage()));
    }
}
