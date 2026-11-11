package com.aurora.repositories;

import com.aurora.models.Teacher;
import com.aurora.models.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    @Override
    @EntityGraph(attributePaths = {"user", "subjects", "classes"})
    Optional<Teacher> findById(Long id);

    @EntityGraph(attributePaths = {"user", "subjects", "classes"})
    Optional<Teacher> findByUser(User user);
    @EntityGraph(attributePaths = {"user", "subjects", "classes"})
    List<Teacher> findByOrganizationKeyAndSubjectAndActiveTrue(String organizationKey, String subject);
    @EntityGraph(attributePaths = {"user", "subjects", "classes"})
    List<Teacher> findByOrganizationKeyAndActiveTrue(String organizationKey);
}
