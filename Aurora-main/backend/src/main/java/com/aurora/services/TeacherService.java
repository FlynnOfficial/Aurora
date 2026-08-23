package com.aurora.services;

import com.aurora.models.Teacher;
import com.aurora.models.User;
import com.aurora.repositories.TeacherRepository;
import com.aurora.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    public Teacher createTeacher(Long userId, String subject, Set<String> classes) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));

        Teacher teacher = Teacher.builder()
                .user(user)
                .subject(subject)
                .classes(classes)
                .active(true)
                .build();

        return teacherRepository.save(teacher);
    }

    public Optional<Teacher> getTeacherByUserId(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.flatMap(teacherRepository::findByUser);
    }

    public List<Teacher> getTeachersBySubject(String subject) {
        return teacherRepository.findBySubject(subject);
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findByActive(true);
    }

    public Teacher updateTeacher(Long teacherId, Teacher updates) throws Exception {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new Exception("Professor não encontrado"));

        if (updates.getSubject() != null) {
            teacher.setSubject(updates.getSubject());
        }
        if (updates.getClasses() != null) {
            teacher.setClasses(updates.getClasses());
        }
        if (updates.getCpf() != null) {
            teacher.setCpf(updates.getCpf());
        }
        if (updates.getPhone() != null) {
            teacher.setPhone(updates.getPhone());
        }
        if (updates.getAddress() != null) {
            teacher.setAddress(updates.getAddress());
        }

        return teacherRepository.save(teacher);
    }

    public void deleteTeacher(Long teacherId) throws Exception {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new Exception("Professor não encontrado"));
        teacher.setActive(false);
        teacherRepository.save(teacher);
    }
}