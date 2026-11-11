package com.aurora.services;

import com.aurora.models.Teacher;
import com.aurora.models.User;
import com.aurora.models.Subject;
import com.aurora.repositories.TeacherRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.repositories.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public Teacher createTeacher(Long userId, String subject, Set<String> classes) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));
        if (user.getRole() != User.UserRole.TEACHER) throw new Exception("Perfil de professor inválido");

        Set<Subject> subjects = subjectRepository.findByOrganizationKeyAndActiveTrueOrderByName(user.getOrganizationKey()).stream()
            .filter(value -> value.getName().equals(subject)).collect(java.util.stream.Collectors.toSet());
        Teacher teacher = Teacher.builder()
                .user(user)
                .organizationKey(user.getOrganizationKey())
                .subject(subject)
                .subjects(subjects)
                .classes(classes)
                .active(true)
                .build();

        return teacherRepository.save(teacher);
    }

    public Optional<Teacher> getTeacherByUserId(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.flatMap(teacherRepository::findByUser);
    }

    public List<Teacher> getTeachersBySubject(Long requesterId, String subject) throws Exception {
        return teacherRepository.findByOrganizationKeyAndSubjectAndActiveTrue(organization(requesterId), subject);
    }

    public List<Teacher> getAllTeachers(Long requesterId) throws Exception {
        return teacherRepository.findByOrganizationKeyAndActiveTrue(organization(requesterId));
    }

    public void authorizeProfileAccess(Long requesterId, Long teacherId) throws Exception {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new Exception("Professor não encontrado"));
        if (!teacher.getOrganizationKey().equals(organization(requesterId))) {
            throw new Exception("Sem permissão para este professor");
        }
    }

    private String organization(Long userId) throws Exception {
        return userRepository.findById(userId).orElseThrow(() -> new Exception("Usuário não encontrado"))
                .getOrganizationKey();
    }

    @Transactional(rollbackFor = Exception.class)
    public Teacher updateTeacher(Long teacherId, Teacher updates) throws Exception {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new Exception("Professor não encontrado"));

        if (updates.getSubject() != null) {
            teacher.setSubject(updates.getSubject());
        }
        if (updates.getSubjects() != null && !updates.getSubjects().isEmpty()) {
            Set<Long> subjectIds = updates.getSubjects().stream().map(Subject::getId).collect(java.util.stream.Collectors.toSet());
            Set<Subject> subjects = subjectRepository.findByOrganizationKeyAndActiveTrueOrderByName(teacher.getOrganizationKey())
                    .stream().filter(subject -> subjectIds.contains(subject.getId())).collect(java.util.stream.Collectors.toSet());
            if (subjects.size() != subjectIds.size()) throw new Exception("Matéria inválida");
            teacher.setSubjects(subjects);
            teacher.setSubject(teacher.getSubjects().iterator().next().getName());
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

        return teacher;
    }

    public void deleteTeacher(Long teacherId) throws Exception {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new Exception("Professor não encontrado"));
        teacher.setActive(false);
        teacherRepository.save(teacher);
    }

    public void authorizeUserAccess(Long requesterId, String role, Long targetUserId) throws Exception {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));
        if (!requester.getOrganizationKey().equals(target.getOrganizationKey()) ||
                (!requesterId.equals(targetUserId) && !"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role))) {
            throw new Exception("Sem permissão para este usuário");
        }
    }
}
