package com.aurora;

import com.aurora.models.Student;
import com.aurora.models.User;
import com.aurora.repositories.StudentRepository;
import com.aurora.repositories.UserRepository;
import com.aurora.utils.JWTUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SchoolFlowsTest {
    private static final String PASSWORD = "Aurora-Test2026!";
    private static final String CLASS_NAME = "Informática A";
    private static final String SUBJECT = "Programação";
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;
    @Autowired private UserRepository users;
    @Autowired private StudentRepository students;
    @Autowired private PasswordEncoder passwords;
    @Autowired private JWTUtil jwt;
    @Value("${jwt.secret}") private String signingSecret;
    private String organization;
    private Cookie administrator;
    private Cookie superAdministrator;
    private long teacher;
    private long student;
    private long outsider;

    @BeforeEach
    void school() throws Exception {
        organization = UUID.randomUUID().toString();
        administrator = login(seed("admin", User.UserRole.ADMIN));
        superAdministrator = login(seed("super", User.UserRole.SUPER_ADMIN));
        request(post("/admin/classes").cookie(administrator), Map.of("name", CLASS_NAME, "schoolYear", 2026))
                .andExpect(status().isOk());
        request(post("/admin/classes").cookie(administrator), Map.of("name", "Informática B", "schoolYear", 2026))
                .andExpect(status().isOk());
        request(post("/admin/subjects").cookie(administrator), Map.of("name", SUBJECT)).andExpect(status().isOk());
        teacher = createUser("teacher", "TEACHER", Map.of("subjects", List.of(SUBJECT), "classes", List.of(CLASS_NAME)));
        student = createUser("student", "STUDENT", Map.of("className", CLASS_NAME, "enrollment", organization + "-1"));
        outsider = createUser("outsider", "STUDENT", Map.of("className", "Informática B", "enrollment", organization + "-2"));
    }

    @Test
    void authenticatesProfilesAndRestrictsSchoolData() throws Exception {
        Cookie studentSession = login(email("student"));
        mvc.perform(get("/auth/me").cookie(studentSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"));
        mvc.perform(get("/auth/me").cookie(new Cookie("aurora_access", "invalido"))).andExpect(status().isUnauthorized());
        var expired = new JWTUtil(signingSecret, -60000, 60000);
        mvc.perform(get("/auth/me").cookie(new Cookie("aurora_access",
                expired.generateAccessToken(student, email("student"), "STUDENT")))).andExpect(status().isUnauthorized());
        mvc.perform(get("/auth/me").cookie(new Cookie("aurora_access",
                jwt.generateRefreshToken(student, email("student"))))).andExpect(status().isUnauthorized());
        mvc.perform(post("/auth/refresh-token").cookie(new Cookie("aurora_refresh",
                jwt.generateRefreshToken(student, email("student"))))).andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"));
        request(post("/auth/login"), Map.of("email", email("student"), "password", "Wrong-Test2026!"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/students/{id}", student).cookie(studentSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(student));
        mvc.perform(get("/students/{id}", outsider).cookie(studentSession)).andExpect(status().isBadRequest());
        mvc.perform(get("/teachers/{id}", teacher).cookie(login(email("teacher")))).andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(teacher))
                .andExpect(jsonPath("$.classes[0]").value(CLASS_NAME));
        request(post("/grades").cookie(studentSession), Map.of("studentId", profile(student)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/grades/subject/{subject}", SUBJECT).cookie(studentSession)).andExpect(status().isForbidden());
        mvc.perform(get("/admin/users").cookie(login(email("teacher")))).andExpect(status().isForbidden());
        mvc.perform(get("/admin/registrations").cookie(administrator)).andExpect(status().isForbidden());
        mvc.perform(get("/admin/registrations").cookie(superAdministrator)).andExpect(status().isOk());
        mvc.perform(get("/admin/users").cookie(administrator)).andExpect(status().isOk());
    }

    @Test
    void persistsPrivateChatAndKeepsSupportAvailable() throws Exception {
        Cookie studentSession = login(email("student"));
        Cookie teacherSession = login(email("teacher"));
        Cookie otherSession = login(email("outsider"));
        mvc.perform(get("/support/contacts").cookie(studentSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(teacher));
        mvc.perform(get("/support/contacts").cookie(teacherSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(student))
                .andExpect(jsonPath("$.length()").value(1));
        request(post("/support/direct/{id}", teacher).cookie(otherSession), draft("Olá"))
                .andExpect(status().isForbidden());

        Map<String, Object> first = draft("Preciso de ajuda com a atividade.");
        Map<String, Object> reply = draft("Vamos revisar juntos.");
        long chat;
        try (var pool = Executors.newFixedThreadPool(2)) {
            var ready = new CountDownLatch(1);
            var fromStudent = pool.submit(() -> {
                ready.await();
                return id(request(post("/support/direct/{id}", teacher).cookie(studentSession), first));
            });
            var fromTeacher = pool.submit(() -> {
                ready.await();
                return id(request(post("/support/direct/{id}", student).cookie(teacherSession), reply));
            });
            ready.countDown();
            chat = fromStudent.get(20, TimeUnit.SECONDS);
            assertEquals(chat, fromTeacher.get(20, TimeUnit.SECONDS));
        }
        assertEquals(chat, id(request(post("/support/direct/{id}", teacher).cookie(studentSession), first)));
        var third = draft("Obrigado!");
        request(post("/support/chats/{id}/messages", chat).cookie(studentSession), third).andExpect(status().isOk());
        request(post("/support/chats/{id}/messages", chat).cookie(studentSession), third).andExpect(status().isOk());
        mvc.perform(get("/support/chats").cookie(teacherSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(chat));
        mvc.perform(post("/auth/logout").cookie(studentSession)).andExpect(status().isOk())
                .andExpect(header().stringValues("Set-Cookie", org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.containsString("Max-Age=0"))));
        for (Cookie participant : List.of(login(email("student")), teacherSession)) {
            JsonNode history = body(mvc.perform(get("/support/chats/{id}/messages", chat).cookie(participant)));
            assertEquals(3, history.size());
            assertEquals(student, history.get(2).path("sender").path("id").asLong());
            assertEquals("Obrigado!", history.get(2).path("content").asText());
        }
        for (Cookie nonParticipant : List.of(otherSession, administrator, superAdministrator)) {
            mvc.perform(get("/support/chats/{id}/messages", chat).cookie(nonParticipant)).andExpect(status().isNotFound());
            request(post("/support/chats/{id}/messages", chat).cookie(nonParticipant), draft("Olá"))
                    .andExpect(status().isNotFound());
        }
        mvc.perform(put("/support/chats/{id}/close", chat).cookie(studentSession)).andExpect(status().isBadRequest());

        var ticketDraft = draft("Solicitação ao suporte");
        long ticket = id(request(post("/support/chats").cookie(administrator), ticketDraft));
        assertEquals(ticket, id(request(post("/support/chats").cookie(administrator), ticketDraft)));
        mvc.perform(get("/support/chats").cookie(superAdministrator)).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + chat + ")]").isEmpty());
        request(post("/support/chats/{id}/messages", ticket).cookie(superAdministrator), draft("Recebido"))
                .andExpect(status().isOk());
        mvc.perform(get("/support/chats/{id}/messages", ticket).cookie(administrator)).andExpect(status().isOk())
                .andExpect(jsonPath("$[1].content").value("Recebido"));
        mvc.perform(put("/support/chats/{id}/close", ticket).cookie(superAdministrator)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));

        Student profile = students.findById(profile(student)).orElseThrow();
        profile.setClassName("Informática B");
        students.save(profile);
        mvc.perform(get("/support/chats/{id}/messages", chat).cookie(teacherSession)).andExpect(status().isNotFound());
    }

    @Test
    void createsSubmitsAndGradesActivities() throws Exception {
        Cookie teacherSession = login(email("teacher"));
        Cookie studentSession = login(email("student"));
        Cookie otherSession = login(email("outsider"));
        var payload = new java.util.HashMap<String, Object>(Map.of(
                "title", "Exercícios de lógica", "subject", SUBJECT, "className", CLASS_NAME,
                "dueDate", Instant.now().plus(2, ChronoUnit.DAYS).toString(),
                "questions", List.of(
                        Map.of("type", "MULTIPLE_CHOICE", "prompt", "Escolha a opção", "points", 4,
                                "options", "[{\"id\":\"a\",\"text\":\"Sim\"}]", "correctAnswer", "a"),
                        Map.of("type", "ESSAY", "prompt", "Explique", "points", 6))));
        payload.put("className", "Informática B");
        request(post("/activities").cookie(teacherSession), payload).andExpect(status().isBadRequest());
        payload.put("className", CLASS_NAME);
        long activity = id(request(post("/activities").cookie(teacherSession), payload));
        JsonNode listed = body(mvc.perform(get("/activities/student").cookie(studentSession)));
        assertEquals(activity, listed.get(0).path("id").asLong());
        JsonNode questions = listed.get(0).path("questions");
        assertFalse(questions.get(0).has("correctAnswer"));
        long objective = questions.get(0).path("id").asLong();
        long essay = questions.get(1).path("id").asLong();
        var answers = List.of(Map.of("questionId", objective, "answer", "a"),
                Map.of("questionId", essay, "answer", "Resposta do aluno"));
        request(post("/activities/{id}/submit", activity).cookie(otherSession), answers).andExpect(status().isBadRequest());
        long submission = id(request(post("/activities/{id}/submit", activity).cookie(studentSession), answers)
                .andExpect(jsonPath("$.status").value("SUBMITTED")));
        request(post("/activities/{id}/submit", activity).cookie(studentSession), answers).andExpect(status().isBadRequest());
        mvc.perform(get("/activities/{id}/submissions", activity).cookie(studentSession)).andExpect(status().isForbidden());
        request(put("/activities/submissions/{id}/grade", submission).cookie(teacherSession),
                Map.of("questions", List.of(Map.of("questionId", essay, "score", 7)))).andExpect(status().isBadRequest());
        request(put("/activities/submissions/{id}/grade", submission).cookie(teacherSession),
                Map.of("questions", List.of(Map.of("questionId", essay, "score", 5, "feedback", "Boa resposta"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalScore").value(9));
        mvc.perform(get("/activities/student").cookie(studentSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].submission.status").value("GRADED"))
                .andExpect(jsonPath("$[0].questions[0].correctAnswer").value("a"));
        mvc.perform(get("/activities/teacher/overview").cookie(teacherSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$.students[0].id").value(profile(student)))
                .andExpect(jsonPath("$.teacher.user.id").value(teacher));
        mvc.perform(get("/grades/student/{id}", profile(student)).cookie(studentSession)).andExpect(status().isOk());
    }

    @Test
    void registersAndApprovesAdministrator() throws Exception {
        request(post("/auth/register"), Map.of("name", "Nova Administração", "email", email("new-admin"),
                "password", PASSWORD, "organizationKey", organization)).andExpect(status().isCreated());
        JsonNode pending = body(mvc.perform(get("/admin/registrations/pending").cookie(superAdministrator)));
        long registration = 0;
        for (JsonNode item : pending) {
            if (email("new-admin").equals(item.path("email").asText())) registration = item.path("id").asLong();
        }
        assertTrue(registration > 0);
        mvc.perform(put("/admin/registrations/{id}/approve", registration).cookie(superAdministrator))
                .andExpect(status().isOk());
        mvc.perform(put("/admin/registrations/{id}/reject", registration).cookie(superAdministrator))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/admin/classes").cookie(login(email("new-admin")))).andExpect(status().isOk());
    }

    private Map<String, Object> draft(String content) {
        return Map.of("content", content, "requestId", UUID.randomUUID());
    }

    private String email(String name) {
        return name + "-" + organization + "@aurora.test";
    }

    private String seed(String name, User.UserRole role) {
        String email = email(name);
        users.save(User.builder().name(name).email(email).organizationKey(organization)
                .password(passwords.encode(PASSWORD)).role(role).build());
        return email;
    }

    private long createUser(String name, String role, Map<String, Object> fields) throws Exception {
        var input = new java.util.HashMap<>(fields);
        input.putAll(Map.of("name", name, "role", role, "email", email(name), "password", PASSWORD));
        return id(request(post("/admin/users").cookie(administrator), input));
    }

    private Cookie login(String email) throws Exception {
        var response = request(post("/auth/login"), Map.of("email", email, "password", PASSWORD))
                .andExpect(status().isOk()).andReturn().getResponse();
        return java.util.Objects.requireNonNull(response.getCookie("aurora_access"));
    }

    private long profile(long userId) {
        return students.findByUser(users.findById(userId).orElseThrow()).orElseThrow().getId();
    }

    private ResultActions request(MockHttpServletRequestBuilder request, Object body) throws Exception {
        return mvc.perform(request.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body)));
    }

    private long id(ResultActions result) throws Exception {
        return body(result).path("id").asLong();
    }

    private JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray());
    }
}
