package com.aurora.repositories;

import com.aurora.models.Grade;
import com.aurora.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudent(Student student);
    List<Grade> findByStudentAndSubject(Student student, String subject);
    List<Grade> findBySubject(String subject);
}