package com.aurora.repositories;

import com.aurora.models.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByOrganizationKeyAndActiveTrueOrderByName(String organizationKey);
}