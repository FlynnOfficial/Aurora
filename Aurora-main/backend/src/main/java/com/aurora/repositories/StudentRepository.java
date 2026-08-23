package com.aurora.repositories;

import com.aurora.models.Student;
import com.aurora.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByEnrollment(String enrollment);
    List<Student> findByClassName(String className);
    List<Student> findByActive(Boolean active);
}