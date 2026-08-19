package com.aurora.repositories;

import com.aurora.models.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByStatus(Registration.Status status);
    List<Registration> findByType(Registration.RegistrationType type);
}