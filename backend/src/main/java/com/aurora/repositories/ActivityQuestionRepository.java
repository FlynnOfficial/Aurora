package com.aurora.repositories;

import com.aurora.models.ActivityQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityQuestionRepository extends JpaRepository<ActivityQuestion, Long> {
}