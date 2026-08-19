package com.aurora.repositories;

import com.aurora.models.Activity;
import com.aurora.models.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTeacher(Teacher teacher);
    List<Activity> findBySubject(String subject);
    List<Activity> findByStatus(Activity.Status status);
}