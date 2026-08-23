package com.aurora.services;

import com.aurora.models.Registration;
import com.aurora.repositories.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final RegistrationRepository registrationRepository;

    public Registration createRegistration(Registration.RegistrationType type, String data) {
        Registration registration = new Registration();
        registration.setType(type);
        registration.setData(data);
        registration.setStatus(Registration.Status.PENDING);
        return registrationRepository.save(registration);
    }

    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public List<Registration> getPendingRegistrations() {
        return registrationRepository.findByStatus(Registration.Status.PENDING);
    }

    public List<Registration> getApprovedRegistrations() {
        return registrationRepository.findByStatus(Registration.Status.APPROVED);
    }

    public Registration getRegistrationById(Long id) throws Exception {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new Exception("Registro não encontrado"));
    }
}