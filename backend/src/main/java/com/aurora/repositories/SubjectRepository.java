package com.aurora.repositories;

import com.aurora.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByOrganizationKeyAndActiveTrueOrderByName(String organizationKey);
    Optional<Subject> findByOrganizationKeyAndName(String organizationKey, String name);
}