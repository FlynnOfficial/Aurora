package com.aurora.repositories;

import com.aurora.models.Activity;
import com.aurora.models.Student;
import com.aurora.models.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByActivityAndStudent(Activity activity, Student student);
    List<Submission> findByActivityOrderBySubmittedAtAsc(Activity activity);
    List<Submission> findByActivityInOrderBySubmittedAtAsc(List<Activity> activities);
    List<Submission> findByStudentAndActivityIn(Student student, List<Activity> activities);
    List<Submission> findByStudentOrderBySubmittedAtDesc(Student student);
}