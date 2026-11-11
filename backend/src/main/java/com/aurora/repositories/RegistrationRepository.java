package com.aurora.repositories;

import com.aurora.models.Registration;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByStatus(Registration.Status status);
    List<Registration> findByType(Registration.RegistrationType type);
    boolean existsByEmailAndStatus(String email, Registration.Status status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select registration from Registration registration where registration.id = :id")
    Optional<Registration> findForReview(Long id);
}
