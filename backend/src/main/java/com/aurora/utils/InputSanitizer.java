package com.aurora.utils;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class InputSanitizer {
    // Padrões para detectar tentativas de SQL Injection
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            "('|(\\-\\-)|(;)|(\\|\\|)|(\\*)|(/\\*)|(\\*/)|xp_|sp_|exec|execute|select|insert|update|delete|drop|union|from|where|or|and)",
            Pattern.CASE_INSENSITIVE
    );

    // Padrões para detectar XSS
    private static final Pattern XSS_PATTERN = Pattern.compile(
            "(<)|(</)|(javascript:)|(on\\w+\\s*=)|(\\*)|(;)",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Sanitiza entrada para evitar SQL Injection
     */
    public String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }

        // Remove caracteres perigosos
        input = input.trim();

        // Verifica padrões suspeitos
        if (SQL_INJECTION_PATTERN.matcher(input).find()) {
            throw new IllegalArgumentException("Entrada contém caracteres suspeitos");
        }

        // Escapa caracteres especiais
        return input.replaceAll("[\"']", "");
    }

    /**
     * Sanitiza email
     */
    public String sanitizeEmail(String email) {
        if (email == null) {
            return null;
        }

        email = email.trim().toLowerCase();

        // Regex para validação de email
        String emailPattern = "^[A-Za-z0-9+_.-]+@(.+)$";
        if (!email.matches(emailPattern)) {
            throw new IllegalArgumentException("Email inválido");
        }

        if (SQL_INJECTION_PATTERN.matcher(email).find()) {
            throw new IllegalArgumentException("Email contém caracteres suspeitos");
        }

        return email;
    }

    /**
     * Sanitiza senha (menos restritivo)
     */
    public String sanitizePassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Senha não pode estar vazia");
        }

        // Valida tamanho
        if (password.length() < 8 || password.length() > 128) {
            throw new IllegalArgumentException("Senha deve ter entre 8 e 128 caracteres");
        }

        return password;
    }

    /**
     * Sanitiza texto genérico (para nomes, endereços, etc)
     */
    public String sanitizeText(String text) {
        if (text == null) {
            return null;
        }

        text = text.trim();

        if (XSS_PATTERN.matcher(text).find()) {
            throw new IllegalArgumentException("Texto contém caracteres inválidos");
        }

        // Remove caracteres de controle
        return text.replaceAll("[\\x00-\\x1F]", "");
    }

    /**
     * Valida número (CPF, CNPJ, etc)
     */
    public String sanitizeNumeric(String numeric) {
        if (numeric == null) {
            return null;
        }

        // Remove tudo que não é número
        return numeric.replaceAll("[^0-9]", "");
    }
}