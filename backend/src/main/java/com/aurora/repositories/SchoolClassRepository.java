package com.aurora.repositories;

import com.aurora.models.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByOrganizationKeyAndActiveTrueOrderByName(String organizationKey);
    Optional<SchoolClass> findByOrganizationKeyAndNameAndSchoolYear(String organizationKey, String name, Integer schoolYear);
}