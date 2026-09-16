package com.aurora.services;

import com.aurora.models.Registration;
import com.aurora.models.User;
import com.aurora.models.Teacher;
import com.aurora.models.Student;
import com.aurora.repositories.RegistrationRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.repositories.TeacherRepository;
import com.aurora.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

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

    public List<User> getUsersFor(Long requesterId) throws Exception {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new Exception("Administrador nao encontrado"));
        List<User> users = requester.getRole() == User.UserRole.SUPER_ADMIN
                ? userRepository.findByActive(true)
                : userRepository.findByOrganizationKeyAndActiveTrue(requester.getOrganizationKey());
        return users.stream().filter(user -> switch (user.getRole()) {
            case TEACHER -> teacherRepository.findByUser(user).filter(teacher ->
                    teacher.getSubject() != null && !teacher.getSubject().isBlank() &&
                    teacher.getClasses() != null && !teacher.getClasses().isEmpty()).map(teacher -> {
                        user.setAssignedSubject(teacher.getSubject());
                        user.setAssignedClasses(teacher.getClasses());
                        return true;
                    }).orElse(false);
            case STUDENT -> studentRepository.findByUser(user).isPresent();
            default -> true;
        }).toList();
    }

    public User createUser(Long requesterId, String name, String email, String password, User.UserRole role, String subject, java.util.Set<String> classes, String className, String enrollment) throws Exception {
        User requester = userRepository.findById(requesterId).orElseThrow(() -> new Exception("Administrador nao encontrado"));
        if (requester.getRole() != User.UserRole.ADMIN && requester.getRole() != User.UserRole.SUPER_ADMIN) throw new Exception("Sem permissao");
        if (role == User.UserRole.SUPER_ADMIN) throw new Exception("Super Admin nao pode ser criado pelo site");
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) throw new Exception("Email ja cadastrado");
        User user = userRepository.save(User.builder().name(name.trim()).email(email.trim().toLowerCase()).password(passwordEncoder.encode(password)).role(role).organizationKey(requester.getOrganizationKey()).active(true).failedAttempts(0).build());
        if (role == User.UserRole.TEACHER) {
            teacherRepository.save(Teacher.builder().user(user).organizationKey(requester.getOrganizationKey()).subject(subject).classes(classes == null ? java.util.Set.of() : classes).active(true).build());
        } else if (role == User.UserRole.STUDENT) {
            studentRepository.save(Student.builder().user(user).organizationKey(requester.getOrganizationKey()).className(className).enrollment(enrollment).active(true).build());
        }
        return user;
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