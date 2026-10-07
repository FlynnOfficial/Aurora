package com.aurora.utils;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class ValidationUtil {
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";
    private static final Pattern EMAIL_REGEX = Pattern.compile(EMAIL_PATTERN);

    public boolean isValidEmail(String email) {
        return EMAIL_REGEX.matcher(email).matches();
    }

    public boolean isValidCPF(String cpf) {
        cpf = cpf.replaceAll("[^0-9]", "");
        return cpf.length() == 11;
    }

    public boolean isValidCNPJ(String cnpj) {
        cnpj = cnpj.replaceAll("[^0-9]", "");
        return cnpj.length() == 14;
    }

    public boolean isValidPhone(String phone) {
        phone = phone.replaceAll("[^0-9]", "");
        return phone.length() >= 10 && phone.length() <= 11;
    }

    public boolean isStrongPassword(String password) {
        return password.length() >= 8 &&
                password.matches(".*[A-Z].*") && // Uppercase
                password.matches(".*[a-z].*") && // Lowercase
                password.matches(".*\\d.*") &&   // Digit
                password.matches(".*[^A-Za-z0-9].*"); // Special char
    }
}