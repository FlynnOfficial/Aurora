package com.aurora.services;

import com.aurora.models.Registration;
import com.aurora.models.User;
import com.aurora.repositories.RegistrationRepository;
import com.aurora.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public List<Registration> getPendingRegistrations() {
        return registrationRepository.findByStatus(Registration.Status.PENDING);
    }

    public Registration approveRegistration(Long registrationId) throws Exception {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new Exception("Registro não encontrado"));

        registration.setStatus(Registration.Status.APPROVED);
        return registrationRepository.save(registration);
    }

    public Registration rejectRegistration(Long registrationId) throws Exception {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new Exception("Registro não encontrado"));

        registration.setStatus(Registration.Status.REJECTED);
        return registrationRepository.save(registration);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deactivateUser(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));
        user.setActive(false);
        userRepository.save(user);
    }
}