-- ============================================
-- Aurora School System - Initial Data Script
-- ============================================
-- Este arquivo contém dados iniciais para testes
-- Executar APÓS schema.sql

USE aurora_db;

-- ============================================
-- Limpar dados existentes (opcional)
-- ============================================
-- DELETE FROM security_audits;
-- DELETE FROM activities;
-- DELETE FROM grades;
-- DELETE FROM registrations;
-- DELETE FROM teacher_classes;
-- DELETE FROM teachers;
-- DELETE FROM admins;
-- DELETE FROM students;
-- DELETE FROM users;

-- ============================================
-- Inserir Super Admin
-- ============================================
INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'superadmin@escola.com',
    '$2a$12$R0h.uKvDNxQXvW/KI8eDl.m.HT6TYFbEGXTG1lDHGf5N6d5nJGqt2',
    'Super Admin',
    'SUPER_ADMIN',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

-- ============================================
-- Inserir Admin
-- ============================================
INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'helena.costa@escola.com',
    '$2a$12$yDcXs/r8g4X6N1n5z8Y3H.K5lPq2M0o9B3c4D5e6F7g8H9i0J1k2',
    'Diretora Helena Costa',
    'ADMIN',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

-- Inserir dados de Admin
INSERT INTO admins (user_id, role, cpf, phone, active)
SELECT id, 'Diretora', '123.456.789-00', '(11) 98765-4321', TRUE
FROM users WHERE email = 'helena.costa@escola.com'
ON DUPLICATE KEY UPDATE role=VALUES(role);

-- ============================================
-- Inserir Teachers
-- ============================================
INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'carlos.oliveira@escola.com',
    '$2a$12$7F8g9H0i1J2k3L4m5N6o7P8q9R0s1T2u3V4w5X6y7Z8a9B0c1D2e3',
    'Prof. Carlos Oliveira',
    'TEACHER',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'ana.paula@escola.com',
    '$2a$12$7F8g9H0i1J2k3L4m5N6o7P8q9R0s1T2u3V4w5X6y7Z8a9B0c1D2e3',
    'Profa. Ana Paula',
    'TEACHER',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'roberto.lima@escola.com',
    '$2a$12$7F8g9H0i1J2k3L4m5N6o7P8q9R0s1T2u3V4w5X6y7Z8a9B0c1D2e3',
    'Prof. Roberto Lima',
    'TEACHER',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

-- Inserir dados de Teachers
INSERT INTO teachers (user_id, subject, cpf, phone, active)
SELECT id, 'Matemática', '111.222.333-44', '(11) 99999-1111', TRUE
FROM users WHERE email = 'carlos.oliveira@escola.com'
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

INSERT INTO teachers (user_id, subject, cpf, phone, active)
SELECT id, 'Português', '222.333.444-55', '(11) 99999-2222', TRUE
FROM users WHERE email = 'ana.paula@escola.com'
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

INSERT INTO teachers (user_id, subject, cpf, phone, active)
SELECT id, 'História', '333.444.555-66', '(11) 99999-3333', TRUE
FROM users WHERE email = 'roberto.lima@escola.com'
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

-- Inserir turmas dos teachers
INSERT INTO teacher_classes (teacher_id, class_name)
SELECT t.id, '9º Ano A' FROM teachers t WHERE t.subject = 'Matemática';
INSERT INTO teacher_classes (teacher_id, class_name)
SELECT t.id, '9º Ano B' FROM teachers t WHERE t.subject = 'Matemática';
INSERT INTO teacher_classes (teacher_id, class_name)
SELECT t.id, '8º Ano A' FROM teachers t WHERE t.subject = 'Matemática';

INSERT INTO teacher_classes (teacher_id, class_name)
SELECT t.id, '9º Ano A' FROM teachers t WHERE t.subject = 'Português';
INSERT INTO teacher_classes (teacher_id, class_name)
SELECT t.id, '9º Ano B' FROM teachers t WHERE t.subject = 'Português';

INSERT INTO teacher_classes (teacher_id, class_name)
SELECT t.id, '9º Ano A' FROM teachers t WHERE t.subject = 'História';

-- ============================================
-- Inserir Students
-- ============================================
INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'maria.silva@escola.com',
    '$2a$12$5C9b8K2x3L1m4n5O6p7Q8r9S0t1U2v3W4x5Y6z7A8b9C0d1E2f3',
    'Maria Silva',
    'STUDENT',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'joao.santos@escola.com',
    '$2a$12$5C9b8K2x3L1m4n5O6p7Q8r9S0t1U2v3W4x5Y6z7A8b9C0d1E2f3',
    'João Santos',
    'STUDENT',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

INSERT INTO users (email, password, name, role, active, last_login, failed_attempts)
VALUES (
    'ana.costa@escola.com',
    '$2a$12$5C9b8K2x3L1m4n5O6p7Q8r9S0t1U2v3W4x5Y6z7A8b9C0d1E2f3',
    'Ana Costa',
    'STUDENT',
    TRUE,
    NULL,
    0
) ON DUPLICATE KEY UPDATE password=VALUES(password);

-- Inserir dados de Students
INSERT INTO students (user_id, class_name, enrollment, cpf, phone, active)
SELECT id, '9º Ano A', '2024001', '444.555.666-77', '(11) 98888-1111', TRUE
FROM users WHERE email = 'maria.silva@escola.com'
ON DUPLICATE KEY UPDATE class_name=VALUES(class_name);

INSERT INTO students (user_id, class_name, enrollment, cpf, phone, active)
SELECT id, '9º Ano A', '2024002', '555.666.777-88', '(11) 98888-2222', TRUE
FROM users WHERE email = 'joao.santos@escola.com'
ON DUPLICATE KEY UPDATE class_name=VALUES(class_name);

INSERT INTO students (user_id, class_name, enrollment, cpf, phone, active)
SELECT id, '9º Ano B', '2024003', '666.777.888-99', '(11) 98888-3333', TRUE
FROM users WHERE email = 'ana.costa@escola.com'
ON DUPLICATE KEY UPDATE class_name=VALUES(class_name);

-- ============================================
-- Inserir Grades (Notas)
-- ============================================
-- Maria Silva - Matemática
INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '1º Bimestre', 8.5, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '2º Bimestre', 7.0, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '3º Bimestre', 9.0, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '4º Bimestre', 8.0, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

-- Maria Silva - Português
INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Português', '1º Bimestre', 9.0, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Português', '2º Bimestre', 8.5, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Português', '3º Bimestre', 9.5, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Português', '4º Bimestre', 9.0, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024001';

-- João Santos - Matemática
INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '1º Bimestre', 7.0, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024002';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '2º Bimestre', 6.5, 1, 'RECOVERING'
FROM students s WHERE s.enrollment = '2024002';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '3º Bimestre', 7.5, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024002';

INSERT INTO grades (student_id, subject, period, value, weight, status)
SELECT s.id, 'Matemática', '4º Bimestre', 8.0, 1, 'APPROVED'
FROM students s WHERE s.enrollment = '2024002';

-- ============================================
-- Inserir Activities (Atividades)
-- ============================================
INSERT INTO activities (title, subject, teacher_id, description, due_date, status, questions)
SELECT 
    'Lista de Exercícios — Equações do 2º Grau',
    'Matemática',
    t.id,
    'Resolva as questões abaixo sobre equações do 2º grau.',
    '2025-02-15',
    'PENDING',
    '[]'
FROM teachers t WHERE t.subject = 'Matemática' LIMIT 1;

INSERT INTO activities (title, subject, teacher_id, description, due_date, status, questions)
SELECT 
    'Redação — Meio Ambiente',
    'Português',
    t.id,
    'Produza um texto dissertativo-argumentativo sobre o tema proposto.',
    '2025-02-12',
    'SUBMITTED',
    '[]'
FROM teachers t WHERE t.subject = 'Português' LIMIT 1;

INSERT INTO activities (title, subject, teacher_id, description, due_date, status, questions)
SELECT 
    'Questões — Segunda Guerra Mundial',
    'História',
    t.id,
    'Avaliação sobre as causas, desenvolvimento e consequências da Segunda Guerra Mundial.',
    '2025-02-20',
    'GRADED',
    '[]'
FROM teachers t WHERE t.subject = 'História' LIMIT 1;

-- ============================================
-- Inserir Registrations (Cadastros Pendentes)
-- ============================================
INSERT INTO registrations (type, data, status, submitted_at)
VALUES (
    'FISICA',
    '{
        "cpf": "123.456.789-00",
        "nome": "Roberto",
        "sobrenome": "Almeida",
        "dataNascimento": "1985-04-12",
        "email": "roberto.almeida@email.com",
        "telefone": "(11) 98765-4321"
    }',
    'PENDING',
    UNIX_TIMESTAMP() * 1000
);

INSERT INTO registrations (type, data, status, submitted_at)
VALUES (
    'JURIDICA',
    '{
        "cnpj": "12.345.678/0001-99",
        "nomeRepresentante": "Fernanda",
        "sobrenomeRepresentante": "Gomes",
        "nomeEmpresa": "Escola Futuro Brilhante",
        "razaoSocial": "Futuro Brilhante Educação LTDA",
        "endereco": "Av. Paulista, 1000, 01311-000, SP",
        "telefoneComercial": "(11) 3456-7890",
        "emailInstitucional": "contato@futurobrilhante.com.br",
        "cpfRepresentante": "987.654.321-00",
        "cargoRepresentante": "Diretora Executiva",
        "telefoneRepresentante": "(11) 99999-8888"
    }',
    'PENDING',
    UNIX_TIMESTAMP() * 1000
);

-- ============================================
-- Verificar dados inseridos
-- ============================================
SELECT 'USERS' as table_name, COUNT(*) as total FROM users
UNION ALL
SELECT 'STUDENTS' as table_name, COUNT(*) as total FROM students
UNION ALL
SELECT 'TEACHERS' as table_name, COUNT(*) as total FROM teachers
UNION ALL
SELECT 'ADMINS' as table_name, COUNT(*) as total FROM admins
UNION ALL
SELECT 'GRADES' as table_name, COUNT(*) as total FROM grades
UNION ALL
SELECT 'ACTIVITIES' as table_name, COUNT(*) as total FROM activities
UNION ALL
SELECT 'REGISTRATIONS' as table_name, COUNT(*) as total FROM registrations;

-- ============================================
-- Senha dos usuários de demo:
-- ============================================
-- aluno123 (Students)
-- prof123 (Teachers)
-- admin123 (Admin)
-- Super@Admin1 (Super Admin)
-- ============================================