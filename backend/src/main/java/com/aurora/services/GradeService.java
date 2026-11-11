package com.aurora.services;

import com.aurora.models.Grade;
import com.aurora.models.Student;
import com.aurora.models.Subject;
import com.aurora.models.Teacher;
import com.aurora.repositories.TeacherRepository;
import org.springframework.transaction.annotation.Transactional;
import com.aurora.repositories.GradeRepository;
import com.aurora.repositories.StudentRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GradeService {
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    private final TeacherRepository teacherRepository;

    @Transactional(rollbackFor = Exception.class)
    public Grade createGrade(Long requesterId, String role, Long studentId, String subject, String period, Double value, Integer weight) throws Exception {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new Exception("Aluno não encontrado"));
        assertStudentAccess(requesterId, role, student);

        requireGradingPermission(requesterId, subject);
        if (period == null || period.isBlank() || weight == null || weight < 1) {
            throw new Exception("Informe um período e um peso válido");
        }

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
        if (student == null) return List.of();
        Teacher teacher = teacher(user(requesterId));
        return gradeRepository.findByStudent(student).stream()
                .filter(grade -> teacher == null || teaches(teacher, grade.getSubject())).toList();
    }

    public List<Grade> getGradesBySubject(Long requesterId, String subject) throws Exception {
        User requester = requireGradingPermission(requesterId, subject);
        Teacher teacher = teacher(requester);
        return gradeRepository.findBySubjectAndStudentOrganizationKey(subject, requester.getOrganizationKey()).stream()
                .filter(grade -> teacher == null || teacher.getClasses().contains(grade.getStudent().getClassName())).toList();
    }

    public Double calculateStudentAverage(Long requesterId, String role, Long studentId) throws Exception {
        return getGradesByStudent(requesterId, role, studentId).stream()
                .mapToDouble(Grade::getValue)
                .average()
                .orElse(0.0);
    }

    @Transactional(rollbackFor = Exception.class)
    public Grade updateGrade(Long requesterId, String role, Long gradeId, Double newValue) throws Exception {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new Exception("Nota não encontrada"));
        assertStudentAccess(requesterId, role, grade.getStudent());

        requireGradingPermission(requesterId, grade.getSubject());
        grade.setValue(newValue);
        grade.setStatus(determineStatus(newValue));

        return gradeRepository.save(grade);
    }

    private void assertStudentAccess(Long requesterId, String role, Student student) throws Exception {
        User requester = user(requesterId);
        if (!student.getOrganizationKey().equals(requester.getOrganizationKey())) {
            throw new Exception("Recurso fora da organização");
        }
        if ("STUDENT".equals(role) && !student.getUser().getId().equals(requesterId)) {
            throw new Exception("Sem permissão para acessar estas notas");
        }
        Teacher teacher = teacher(requester);
        if (teacher != null && !teacher.getClasses().contains(student.getClassName())) {
            throw new Exception("Aluno fora das turmas do professor");
        }
    }

    private User requireGradingPermission(Long requesterId, String subject) throws Exception {
        User requester = user(requesterId);
        Teacher teacher = teacher(requester);
        if (subject == null || subject.isBlank() || requester.getRole() == User.UserRole.STUDENT
                || (teacher != null && !teaches(teacher, subject))) {
            throw new Exception("Sem permissão para esta matéria");
        }
        return requester;
    }

    private boolean teaches(Teacher teacher, String subject) {
        return teacher.getSubjects().isEmpty() ? subject.equals(teacher.getSubject())
                : teacher.getSubjects().stream().map(Subject::getName).anyMatch(subject::equals);
    }

    private Teacher teacher(User requester) throws Exception {
        if (requester.getRole() != User.UserRole.TEACHER) return null;
        return teacherRepository.findByUser(requester).filter(Teacher::getActive)
                .orElseThrow(() -> new Exception("Professor não encontrado"));
    }

    private User user(Long userId) throws Exception {
        return userRepository.findById(userId).orElseThrow(() -> new Exception("Usuário não encontrado"));
    }

    private Grade.Status determineStatus(Double value) throws Exception {
        if (value == null || !Double.isFinite(value) || value < 0 || value > 10) {
            throw new Exception("A nota precisa estar entre 0 e 10");
        }
        if (value >= 7.0) return Grade.Status.APPROVED;
        if (value >= 5.0) return Grade.Status.RECOVERING;
        return Grade.Status.FAILED;
    }
}