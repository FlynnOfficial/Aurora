package com.aurora.controllers;

import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

final class ApiErrors {
    private ApiErrors() {}

    static ResponseEntity<Map<String, String>> badRequest(Exception error) {
        return response(HttpStatus.BAD_REQUEST, error);
    }

    static ResponseEntity<Map<String, String>> response(HttpStatus status, Exception error) {
        if (error instanceof DataIntegrityViolationException) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Os dados conflitam com um registro existente"));
        }
        if (error instanceof RuntimeException && !(error instanceof IllegalArgumentException)) {
            LoggerFactory.getLogger(ApiErrors.class).error("Falha ao processar requisição ({})", error.getClass().getSimpleName());
            return ResponseEntity.internalServerError().body(Map.of("error", "Não foi possível concluir a solicitação"));
        }
        String message = error.getMessage() == null ? "Solicitação inválida" : error.getMessage();
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
