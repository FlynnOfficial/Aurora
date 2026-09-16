package com.aurora.repositories;

import com.aurora.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByOrganizationKeyAndActiveTrueOrderByName(String organizationKey);
}