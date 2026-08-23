package com.aurora.services;

import com.aurora.models.Grade;
import com.aurora.models.Student;
import com.aurora.repositories.GradeRepository;
import com.aurora.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeService {
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;

    public Grade createGrade(Long studentId, String subject, String period, Double value, Integer weight) throws Exception {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new Exception("Aluno não encontrado"));

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

    public List<Grade> getGradesByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        return student != null ? gradeRepository.findByStudent(student) : List.of();
    }

    public List<Grade> getGradesBySubject(String subject) {
        return gradeRepository.findBySubject(subject);
    }

    public Double calculateStudentAverage(Long studentId) {
        return getGradesByStudent(studentId).stream()
                .mapToDouble(Grade::getValue)
                .average()
                .orElse(0.0);
    }

    public Grade updateGrade(Long gradeId, Double newValue) throws Exception {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new Exception("Nota não encontrada"));

        grade.setValue(newValue);
        grade.setStatus(determineStatus(newValue));

        return gradeRepository.save(grade);
    }

    private Grade.Status determineStatus(Double value) {
        if (value >= 7.0) return Grade.Status.APPROVED;
        if (value >= 5.0) return Grade.Status.RECOVERING;
        return Grade.Status.FAILED;
    }
}