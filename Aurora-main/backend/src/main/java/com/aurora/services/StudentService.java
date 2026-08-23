package com.aurora.services;

import com.aurora.models.Student;
import com.aurora.models.User;
import com.aurora.models.Grade;
import com.aurora.repositories.StudentRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.repositories.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final GradeRepository gradeRepository;

    public Student createStudent(Long userId, String className, String enrollment) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));

        if (studentRepository.findByEnrollment(enrollment).isPresent()) {
            throw new Exception("Matrícula já existe");
        }

        Student student = Student.builder()
                .user(user)
                .className(className)
                .enrollment(enrollment)
                .active(true)
                .build();

        return studentRepository.save(student);
    }

    public Optional<Student> getStudentByUserId(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.flatMap(studentRepository::findByUser);
    }

    public List<Student> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className);
    }

    public List<Grade> getStudentGrades(Long studentId) {
        Optional<Student> student = studentRepository.findById(studentId);
        return student.map(gradeRepository::findByStudent).orElse(List.of());
    }

    public Double calculateAverageBySubject(Long studentId, String subject) {
        Optional<Student> student = studentRepository.findById(studentId);
        if (student.isEmpty()) return 0.0;

        List<Grade> grades = gradeRepository.findByStudentAndSubject(student.get(), subject);
        if (grades.isEmpty()) return 0.0;

        return grades.stream()
                .mapToDouble(Grade::getValue)
                .average()
                .orElse(0.0);
    }

    public Student updateStudent(Long studentId, Student updates) throws Exception {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new Exception("Aluno não encontrado"));

        if (updates.getClassName() != null) {
            student.setClassName(updates.getClassName());
        }
        if (updates.getCpf() != null) {
            student.setCpf(updates.getCpf());
        }
        if (updates.getPhone() != null) {
            student.setPhone(updates.getPhone());
        }
        if (updates.getAddress() != null) {
            student.setAddress(updates.getAddress());
        }

        return studentRepository.save(student);
    }

    public void deleteStudent(Long studentId) throws Exception {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new Exception("Aluno não encontrado"));
        student.setActive(false);
        studentRepository.save(student);
    }
}