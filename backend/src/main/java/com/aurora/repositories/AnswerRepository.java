package com.aurora.repositories;

import com.aurora.models.Answer;
import com.aurora.models.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findBySubmission(Submission submission);
}