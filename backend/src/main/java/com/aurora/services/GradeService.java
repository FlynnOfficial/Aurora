package com.aurora.services;

import com.aurora.models.Grade;
import com.aurora.models.Student;
import com.aurora.repositories.GradeRepository;
import com.aurora.repositories.StudentRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class GradeService {
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public Grade createGrade(Long requesterId, String role, Long studentId, String subject, String period, Double value, Integer weight) throws Exception {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new Exception("Aluno não encontrado"));
        assertStudentAccess(requesterId, role, student);

        Grade grade = Grade.builder()
                .student(student)
                .subject(subject)
                .period(period)
                .value(value)
                .weight(weight)
                .status(determineStatus(value))
                .build();

        return gradeRepository.save(grade);
    }

    public List<Grade> getGradesByStudent(Long requesterId, String role, Long studentId) throws Exception {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student != null) assertStudentAccess(requesterId, role, student);
        return student != null ? gradeRepository.findByStudent(student) : List.of();
    }

    public List<Grade> getGradesBySubject(String subject) {
        return gradeRepository.findBySubject(subject);
    }

    public Double calculateStudentAverage(Long requesterId, String role, Long studentId) throws Exception {
        return getGradesByStudent(requesterId, role, studentId).stream()
                .mapToDouble(Grade::getValue)
                .average()
                .orElse(0.0);
    }

    public Grade updateGrade(Long requesterId, String role, Long gradeId, Double newValue) throws Exception {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new Exception("Nota não encontrada"));
        assertStudentAccess(requesterId, role, grade.getStudent());

        grade.setValue(newValue);
        grade.setStatus(determineStatus(newValue));

        return gradeRepository.save(grade);
    }

    private void assertStudentAccess(Long requesterId, String role, Student student) throws Exception {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new Exception("Usuário não encontrado"));
        if (!student.getOrganizationKey().equals(requester.getOrganizationKey())) {
            throw new Exception("Recurso fora da organização");
        }
        if ("STUDENT".equals(role) && !student.getUser().getId().equals(requesterId)) {
            throw new Exception("Sem permissão para acessar estas notas");
        }
    }

    private Grade.Status determineStatus(Double value) {
        if (value >= 7.0) return Grade.Status.APPROVED;
        if (value >= 5.0) return Grade.Status.RECOVERING;
        return Grade.Status.FAILED;
    }
}