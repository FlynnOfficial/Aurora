package com.aurora.services;

import com.aurora.models.*;
import com.aurora.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final ActivityQuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;
    private final AnswerRepository answerRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Activity create(Long userId, CreateActivityRequest request) throws Exception {
        Teacher teacher = teacherRepository.findByUser(userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuario nao encontrado")))
                .orElseThrow(() -> new Exception("Professor nao encontrado"));

        Instant dueDate = request.dueDate;
        if (dueDate == null || dueDate.isBefore(Instant.now().plus(1, ChronoUnit.DAYS))) {
            throw new Exception("A data de entrega deve ser posterior a hoje");
        }
        if (dueDate.isAfter(Instant.now().plus(366, ChronoUnit.DAYS))) {
            throw new Exception("A data de entrega nao pode ultrapassar um ano");
        }
        if (request.questions == null || request.questions.isEmpty()) {
            throw new Exception("A atividade precisa ter ao menos uma questao");
        }
        BigDecimal totalPoints = request.questions.stream()
                .map(input -> input.points == null ? BigDecimal.ZERO : input.points)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalPoints.compareTo(BigDecimal.TEN) > 0) {
            throw new Exception("A soma dos pontos da atividade nao pode ultrapassar 10");
        }
        Set<String> teacherSubjects = teacher.getSubjects() == null || teacher.getSubjects().isEmpty()
            ? Set.of(teacher.getSubject()) : teacher.getSubjects().stream().map(Subject::getName).collect(java.util.stream.Collectors.toSet());
        if (request.subject == null || !teacherSubjects.contains(request.subject.trim())) {
            throw new Exception("Materia nao lecionada pelo professor");
        }

        Activity activity = new Activity();
        activity.setTitle(request.title.trim());
        activity.setDescription(request.description);
        activity.setSubject(request.subject.trim());
        activity.setClassName(request.className.trim());
        activity.setOrganizationKey(teacher.getUser().getOrganizationKey());
        activity.setTeacher(teacher);
        activity.setDueDate(dueDate);
        activity.setCreatedAt(Instant.now());
        activity = activityRepository.save(activity);

        int position = 1;
        for (QuestionRequest input : request.questions) {
            if (input.points == null || input.points.compareTo(BigDecimal.ZERO) <= 0) {
                throw new Exception("Toda questao precisa ter uma pontuacao positiva");
            }
            ActivityQuestion question = new ActivityQuestion();
            question.setActivity(activity);
            question.setPosition(position++);
            question.setType(input.type);
            question.setPrompt(input.prompt.trim());
            question.setPoints(input.points);
            question.setCorrectAnswer(input.correctAnswer);
            question.setOptions(input.options);
            questionRepository.save(question);
            activity.getQuestionItems().add(question);
        }
        return activity;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> teacherActivities(Long userId) throws Exception {
        Teacher teacher = teacherRepository.findByUser(userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuario nao encontrado")))
                .orElseThrow(() -> new Exception("Professor nao encontrado"));
        return activityRepository.findByTeacherOrderByCreatedAtDesc(teacher).stream()
                .map(activity -> activityView(activity, null, true)).toList();
    }

            @Transactional(readOnly = true)
            public Map<String, Object> teacherOverview(Long userId) throws Exception {
            Teacher teacher = teacherRepository.findByUser(userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuario nao encontrado")))
                .orElseThrow(() -> new Exception("Professor nao encontrado"));
            List<Map<String, Object>> students = studentRepository.findByOrganizationKeyAndClassNameInAndActiveTrue(
                teacher.getOrganizationKey(), teacher.getClasses() == null ? Set.of() : teacher.getClasses()).stream()
                .map(student -> {
                    Map<String, Object> value = new LinkedHashMap<>();
                    value.put("id", student.getId()); value.put("name", student.getUser().getName());
                    value.put("enrollment", student.getEnrollment()); value.put("className", student.getClassName());
                    return value;
                }).toList();
            List<Map<String, Object>> activities = activityRepository.findByTeacherOrderByCreatedAtDesc(teacher).stream()
                .map(activity -> {
                    Map<String, Object> value = activityView(activity, null, true);
                    value.put("submissions", submissionRepository.findByActivityOrderBySubmittedAtAsc(activity).stream()
                        .map(submission -> submissionView(submission, true)).toList());
                    return value;
                }).toList();
            return Map.of("teacher", teacher, "students", students, "activities", activities);
            }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> studentActivities(Long userId) throws Exception {
        Student student = studentRepository.findByUser(userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuario nao encontrado")))
                .orElseThrow(() -> new Exception("Aluno nao encontrado"));
        return activityRepository.findByOrganizationKeyOrderByCreatedAtDesc(student.getUser().getOrganizationKey()).stream()
                .filter(activity -> activity.getClassName().equals(student.getClassName()))
                .map(activity -> {
                    Submission submission = submissionRepository.findByActivityAndStudent(activity, student).orElse(null);
                    return studentActivityView(activity, submission);
                }).toList();
    }

    private Map<String, Object> studentActivityView(Activity activity, Submission submission) {
        Map<String, Object> result = activityView(activity, null, false);
        result.put("submission", submission == null ? null : submissionView(submission, true));
        if (submission != null && submission.getStatus() == Submission.Status.GRADED) {
            result.put("questions", activity.getQuestionItems().stream().map(question -> {
                Map<String, Object> value = new LinkedHashMap<>();
                value.put("id", question.getId()); value.put("position", question.getPosition());
                value.put("type", question.getType()); value.put("prompt", question.getPrompt());
                value.put("points", question.getPoints()); value.put("options", question.getOptions());
                value.put("correctAnswer", question.getCorrectAnswer());
                return value;
            }).toList());
        }
        return result;
    }

    @Transactional
    public Map<String, Object> submit(Long userId, Long activityId, List<AnswerRequest> answers) throws Exception {
        Student student = studentRepository.findByUser(userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuario nao encontrado")))
                .orElseThrow(() -> new Exception("Aluno nao encontrado"));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new Exception("Atividade nao encontrada"));
        if (!activity.getOrganizationKey().equals(student.getUser().getOrganizationKey()) ||
                !activity.getClassName().equals(student.getClassName())) {
            throw new Exception("Atividade nao pertence a sua turma");
        }
        if (activity.getDueDate().isBefore(Instant.now())) {
            throw new Exception("O prazo desta atividade encerrou");
        }
        if (submissionRepository.findByActivityAndStudent(activity, student).isPresent()) {
            throw new Exception("Esta atividade ja foi enviada");
        }

        Submission submission = new Submission();
        submission.setActivity(activity);
        submission.setStudent(student);
        submission.setStatus(Submission.Status.SUBMITTED);
        submission = submissionRepository.save(submission);
        Map<Long, ActivityQuestion> questions = new HashMap<>();
        activity.getQuestionItems().forEach(question -> questions.put(question.getId(), question));
        Map<Long, AnswerRequest> submittedAnswers = Optional.ofNullable(answers).orElse(List.of()).stream()
                .collect(java.util.stream.Collectors.toMap(input -> input.questionId, input -> input, (first, second) -> second));
        for (ActivityQuestion question : questions.values()) {
            AnswerRequest input = submittedAnswers.get(question.getId());
            Answer answer = new Answer();
            answer.setSubmission(submission);
            answer.setQuestion(question);
            answer.setAnswer(input == null ? null : input.answer);
            if (isMultipleChoice(question)) answer.setScore(automaticScore(question, answer.getAnswer()));
            answerRepository.save(answer);
        }
        updateSubmissionScore(submission);
        return submissionView(submissionRepository.save(submission), false);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> submissions(Long userId, Long activityId) throws Exception {
        Activity activity = ownedActivity(userId, activityId);
        return submissionRepository.findByActivityOrderBySubmittedAtAsc(activity).stream()
                .map(submission -> submissionView(submission, true)).toList();
    }

    @Transactional
    public Map<String, Object> grade(Long userId, Long submissionId, GradeRequest request) throws Exception {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new Exception("Entrega nao encontrada"));
        ownedActivity(userId, submission.getActivity().getId());
        Map<Long, Answer> answers = new HashMap<>();
        answerRepository.findBySubmission(submission).forEach(answer -> answers.put(answer.getQuestion().getId(), answer));
        Map<Long, QuestionGrade> requestedGrades = Optional.ofNullable(request.questions).orElse(List.of()).stream()
                .collect(java.util.stream.Collectors.toMap(input -> input.questionId, input -> input, (first, second) -> second));
        for (Answer answer : answers.values()) {
            ActivityQuestion question = answer.getQuestion();
            BigDecimal score;
            if (isMultipleChoice(question)) {
                score = automaticScore(question, answer.getAnswer());
            } else {
                QuestionGrade input = requestedGrades.get(question.getId());
                score = input == null || input.score == null ? BigDecimal.ZERO : input.score;
                answer.setTeacherFeedback(input == null ? null : input.feedback);
            }
            BigDecimal max = question.getPoints();
            if (score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(max) > 0) throw new Exception("Nota fora do limite da questao");
            answer.setScore(score);
            answerRepository.save(answer);
        }
        updateSubmissionScore(submission);
        submission.setTeacherFeedback(request.feedback);
        return submissionView(submissionRepository.save(submission), true);
    }

    private boolean isMultipleChoice(ActivityQuestion question) {
        return question.getType() == ActivityQuestion.QuestionType.MULTIPLE_CHOICE;
    }

    private BigDecimal automaticScore(ActivityQuestion question, String answer) {
        return answer != null && answer.equals(question.getCorrectAnswer()) ? question.getPoints() : BigDecimal.ZERO;
    }

    private void updateSubmissionScore(Submission submission) {
        List<Answer> answers = answerRepository.findBySubmission(submission);
        BigDecimal total = answers.stream()
                .map(answer -> answer.getScore() == null ? BigDecimal.ZERO : answer.getScore())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .min(BigDecimal.TEN)
                .setScale(2, RoundingMode.HALF_UP);
        boolean complete = submission.getActivity().getQuestionItems().stream()
                .allMatch(question -> answers.stream().anyMatch(answer -> question.getId().equals(answer.getQuestion().getId()) && answer.getScore() != null));
        submission.setTotalScore(total);
        if (complete) {
            submission.setGradedAt(Instant.now());
            submission.setStatus(Submission.Status.GRADED);
        } else {
            submission.setStatus(Submission.Status.SUBMITTED);
        }
    }

    private Activity ownedActivity(Long userId, Long activityId) throws Exception {
        Teacher teacher = teacherRepository.findByUser(userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Usuario nao encontrado")))
                .orElseThrow(() -> new Exception("Professor nao encontrado"));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new Exception("Atividade nao encontrada"));
        if (!activity.getTeacher().getId().equals(teacher.getId())) throw new Exception("Atividade nao pertence ao professor");
        return activity;
    }

    private Map<String, Object> activityView(Activity activity, Submission submission, boolean includeAnswers) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", activity.getId()); result.put("title", activity.getTitle()); result.put("subject", activity.getSubject());
        result.put("className", activity.getClassName()); result.put("description", activity.getDescription());
        result.put("dueDate", activity.getDueDate()); result.put("teacherName", activity.getTeacher().getUser().getName());
        result.put("submission", submission == null ? null : submissionView(submission, includeAnswers));
        result.put("questions", activity.getQuestionItems().stream().map(q -> {
            Map<String, Object> question = new LinkedHashMap<>();
            question.put("id", q.getId()); question.put("position", q.getPosition()); question.put("type", q.getType());
            question.put("prompt", q.getPrompt()); question.put("points", q.getPoints()); question.put("options", q.getOptions());
            if (includeAnswers) question.put("correctAnswer", q.getCorrectAnswer());
            return question;
        }).toList());
        return result;
    }

    private Map<String, Object> submissionView(Submission submission, boolean includeAnswers) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", submission.getId()); result.put("status", submission.getStatus()); result.put("submittedAt", submission.getSubmittedAt());
        result.put("gradedAt", submission.getGradedAt()); result.put("totalScore", submission.getTotalScore());
        result.put("teacherFeedback", submission.getTeacherFeedback()); result.put("studentName", submission.getStudent().getUser().getName());
        if (includeAnswers) {
            result.put("answers", answerRepository.findBySubmission(submission).stream().map(answer -> {
                Map<String, Object> value = new LinkedHashMap<>(); value.put("questionId", answer.getQuestion().getId());
                value.put("answer", answer.getAnswer()); value.put("score", answer.getScore()); value.put("teacherFeedback", answer.getTeacherFeedback());
                if (submission.getStatus() == Submission.Status.GRADED) value.put("correctAnswer", answer.getQuestion().getCorrectAnswer());
                return value;
            }).toList());
        }
        return result;
    }

    public static class CreateActivityRequest { public String title, subject, className, description; public Instant dueDate; public List<QuestionRequest> questions; }
    public static class QuestionRequest { public ActivityQuestion.QuestionType type; public String prompt, correctAnswer, options; public BigDecimal points; }
    public static class AnswerRequest { public Long questionId; public String answer; }
    public static class GradeRequest { public String feedback; public List<QuestionGrade> questions; }
    public static class QuestionGrade { public Long questionId; public BigDecimal score; public String feedback; }
}
