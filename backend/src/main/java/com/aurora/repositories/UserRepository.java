package com.aurora.repositories;

import com.aurora.models.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findByRole(User.UserRole role);
    List<User> findByActive(Boolean active);
    List<User> findByOrganizationKey(String organizationKey);
    List<User> findByOrganizationKeyAndActiveTrue(String organizationKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select user from User user where user.id = :id")
    Optional<User> findForUpdate(Long id);

    @Query("""
        select distinct teacherUser from Teacher teacher
        join teacher.user teacherUser join teacher.classes className, Student student join student.user studentUser
        where studentUser.id = :studentId and teacher.active = true and student.active = true
          and teacherUser.active = true and studentUser.active = true
          and teacherUser.role = TEACHER and studentUser.role = STUDENT
          and student.className = className and teacher.organizationKey = student.organizationKey
          and teacherUser.organizationKey = teacher.organizationKey
          and studentUser.organizationKey = student.organizationKey
        order by teacherUser.name, teacherUser.id
        """)
    List<User> findTeachersForStudent(Long studentId);

    @Query("""
        select distinct studentUser from Student student join student.user studentUser,
            Teacher teacher join teacher.user teacherUser join teacher.classes className
        where teacherUser.id = :teacherId and teacher.active = true and student.active = true
          and teacherUser.active = true and studentUser.active = true
          and teacherUser.role = TEACHER and studentUser.role = STUDENT
          and student.className = className and teacher.organizationKey = student.organizationKey
          and teacherUser.organizationKey = teacher.organizationKey
          and studentUser.organizationKey = student.organizationKey
        order by studentUser.name, studentUser.id
        """)
    List<User> findStudentsForTeacher(Long teacherId);
}