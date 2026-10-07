package com.aurora.services;

import com.aurora.models.Registration;
import com.aurora.models.User;
import com.aurora.models.Teacher;
import com.aurora.models.Student;
import com.aurora.models.Grade;
import com.aurora.models.Subject;
import com.aurora.models.AdminUserSummary;
import com.aurora.repositories.RegistrationRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.repositories.TeacherRepository;
import com.aurora.repositories.StudentRepository;
import com.aurora.repositories.SubjectRepository;
import com.aurora.repositories.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminService {
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final GradeRepository gradeRepository;

    public List<Registration> getPendingRegistrations() {
        return registrationRepository.findByStatus(Registration.Status.PENDING);
    }

    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public Registration approveRegistration(Long registrationId) throws Exception {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new Exception("Registro não encontrado"));

        if (registration.getStatus() != Registration.Status.PENDING) {
            throw new Exception("Esta solicitacao ja foi analisada");
        }
        if (userRepository.findByEmail(registration.getEmail()).isPresent()) {
            throw new Exception("Email ja cadastrado");
        }

        userRepository.save(User.builder()
            .email(registration.getEmail())
            .password(registration.getPassword())
            .name(registration.getName())
            .organizationKey(registration.getOrganizationKey())
            .role(User.UserRole.ADMIN)
            .active(true)
            .failedAttempts(0)
            .build());

        registration.setStatus(Registration.Status.APPROVED);
        return registrationRepository.save(registration);
    }

    public Registration rejectRegistration(Long registrationId) throws Exception {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new Exception("Registro não encontrado"));

        registration.setStatus(Registration.Status.REJECTED);
        return registrationRepository.save(registration);
    }

    @Transactional(readOnly = true)
    public List<AdminUserSummary> getUsersFor(Long requesterId) throws Exception {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new Exception("Administrador nao encontrado"));
        List<User> users = requester.getRole() == User.UserRole.SUPER_ADMIN
                ? userRepository.findByActive(true)
                : userRepository.findByOrganizationKeyAndActiveTrue(requester.getOrganizationKey());
        return users.stream().map(this::summarizeUser).toList();
    }

    @Transactional
    public AdminUserSummary createUser(Long requesterId, String name, String email, String password, User.UserRole role, String subject, Set<String> subjects, Set<String> classes, String className, String enrollment) throws Exception {
        User requester = userRepository.findById(requesterId).orElseThrow(() -> new Exception("Administrador nao encontrado"));
        if (requester.getRole() != User.UserRole.ADMIN && requester.getRole() != User.UserRole.SUPER_ADMIN) throw new Exception("Sem permissao");
        if (role == User.UserRole.SUPER_ADMIN) throw new Exception("Super Admin nao pode ser criado pelo site");
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) throw new Exception("Email ja cadastrado");
        User user = userRepository.save(User.builder().name(name.trim()).email(normalizedEmail).password(passwordEncoder.encode(password)).role(role).organizationKey(requester.getOrganizationKey()).active(true).failedAttempts(0).build());
        if (role == User.UserRole.TEACHER) {
            Set<String> assignedSubjects = subjects == null || subjects.isEmpty()
                    ? (subject == null ? Set.of() : Set.of(subject)) : subjects;
            Set<Subject> subjectEntities = subjectRepository.findByOrganizationKeyAndActiveTrueOrderByName(requester.getOrganizationKey()).stream()
                    .filter(value -> assignedSubjects.contains(value.getName())).collect(java.util.stream.Collectors.toSet());
            if (assignedSubjects.isEmpty() || subjectEntities.size() != assignedSubjects.size()) {
                throw new Exception("Selecione ao menos uma materia valida");
            }
            teacherRepository.save(Teacher.builder().user(user).organizationKey(requester.getOrganizationKey())
                    .subject(assignedSubjects.iterator().next()).subjects(subjectEntities)
                    .classes(classes == null ? Set.of() : classes).active(true).build());
        } else if (role == User.UserRole.STUDENT) {
            studentRepository.save(Student.builder().user(user).organizationKey(requester.getOrganizationKey()).className(className).enrollment(enrollment).active(true).build());
        }
        return summarizeUser(user);
    }

    private AdminUserSummary summarizeUser(User user) {
        if (user.getRole() == User.UserRole.STUDENT) {
            return studentRepository.findByUser(user)
                    .map(student -> {
                        List<Grade> grades = gradeRepository.findByStudent(student);
                        Double average = grades.isEmpty() ? null
                                : grades.stream().mapToDouble(Grade::getValue).average().orElseThrow();
                        long approved = grades.stream().filter(grade -> grade.getStatus() == Grade.Status.APPROVED).count();
                        long recovering = grades.stream().filter(grade -> grade.getStatus() == Grade.Status.RECOVERING).count();
                        long failed = grades.stream().filter(grade -> grade.getStatus() == Grade.Status.FAILED).count();
                        String status = grades.isEmpty() ? "NEW"
                                : failed > 0 ? "FAILED"
                                : recovering > 0 ? "RECOVERING" : "REGULAR";
                        return new AdminUserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                                student.getClassName(), student.getEnrollment(), null, Set.of(), Set.of(), average,
                                status, grades.size(), approved, recovering, failed);
                    })
                    .orElseGet(() -> emptySummary(user));
        }
        if (user.getRole() == User.UserRole.TEACHER) {
            return teacherRepository.findByUser(user)
                    .map(teacher -> {
                        Set<String> assignedSubjects = teacher.getSubjects().stream().map(Subject::getName)
                                .collect(java.util.stream.Collectors.toSet());
                        if (assignedSubjects.isEmpty() && teacher.getSubject() != null && !teacher.getSubject().isBlank()) {
                            assignedSubjects = Set.of(teacher.getSubject());
                        }
                        return new AdminUserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                                null, null, teacher.getSubject(), assignedSubjects,
                                teacher.getClasses() == null ? Set.of() : Set.copyOf(teacher.getClasses()),
                                null, null, 0, 0, 0, 0);
                    })
                    .orElseGet(() -> emptySummary(user));
        }
        return emptySummary(user);
    }

    private AdminUserSummary emptySummary(User user) {
        return new AdminUserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                null, null, null, Set.of(), Set.of(), null, null, 0, 0, 0, 0);
    }

    public void deactivateUser(Long requesterId, Long userId) throws Exception {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new Exception("Administrador nao encontrado"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));
        if (requester.getRole() != User.UserRole.SUPER_ADMIN &&
                !requester.getOrganizationKey().equals(user.getOrganizationKey())) {
            throw new Exception("Usuario fora da organizacao do administrador");
        }
        user.setActive(false);
        userRepository.save(user);
    }
}