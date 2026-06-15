DELETE FROM attendance;
DELETE FROM grades;
DELETE FROM class_subjects;
DELETE FROM schedules;
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM subjects;
DELETE FROM classes;
DELETE FROM users;

-- Usuários (senha: 123456)
INSERT INTO users (name, email, password, role, active) VALUES
('Daniel Ferro', 'admin@escola.com', '$2b$10$QAkoMbjqZgOY5h2K4x69SeOzalzAj9mex/DrZKtP/Vw1rmW9ZoaOe', 'admin', true),
('Carlos Silva', 'prof@escola.com', '$2b$10$QAkoMbjqZgOY5h2K4x69SeOzalzAj9mex/DrZKtP/Vw1rmW9ZoaOe', 'teacher', true),
('Ana Costa', 'sec@escola.com', '$2b$10$QAkoMbjqZgOY5h2K4x69SeOzalzAj9mex/DrZKtP/Vw1rmW9ZoaOe', 'secretary', true),
('Maria Silva', 'aluno@escola.com', '$2b$10$QAkoMbjqZgOY5h2K4x69SeOzalzAj9mex/DrZKtP/Vw1rmW9ZoaOe', 'student', true),
('João Pedro', 'aluno2@escola.com', '$2b$10$QAkoMbjqZgOY5h2K4x69SeOzalzAj9mex/DrZKtP/Vw1rmW9ZoaOe', 'student', true);

-- Turmas
INSERT INTO classes (name, grade, shift, year, capacity) VALUES
('9º Ano A', '9º Ano', 'morning', 2026, 30),
('9º Ano B', '9º Ano', 'morning', 2026, 30),
('8º Ano A', '8º Ano', 'afternoon', 2026, 25);

-- Disciplinas
INSERT INTO subjects (name, code, description, workload) VALUES
('Matemática', 'MAT-001', 'Matemática Fundamental', 80),
('Português', 'POR-001', 'Língua Portuguesa', 80),
('História', 'HIS-001', 'História Geral', 60),
('Ciências', 'CIE-001', 'Ciências Naturais', 60),
('Geografia', 'GEO-001', 'Geografia Geral', 60);

-- Professores
INSERT INTO teachers (name, email, phone, hire_date, qualification, department, specialization, status) VALUES
('Carlos Silva', 'prof@escola.com', '(11) 99999-0001', '2015-02-01', 'Mestrado', 'Exatas', 'Matemática', 'active'),
('Maria Oliveira', 'prof2@escola.com', '(11) 99999-0002', '2018-02-01', 'Doutorado', 'Humanas', 'Português', 'active'),
('João Santos', 'joao.santos@escola.com', '(11) 99999-0003', '2010-02-01', 'Mestrado', 'Humanas', 'História', 'active');

-- Alunos
INSERT INTO students (name, email, birth_date, enrollment, class_id, enrollment_status)
SELECT 'Maria Silva', 'aluno@escola.com', '2011-05-10', '2024001', id, 'active'
FROM classes WHERE name = '9º Ano A';

INSERT INTO students (name, email, birth_date, enrollment, class_id, enrollment_status)
SELECT 'João Pedro', 'aluno2@escola.com', '2011-08-15', '2024002', id, 'active'
FROM classes WHERE name = '9º Ano A';

INSERT INTO students (name, email, birth_date, enrollment, class_id, enrollment_status)
SELECT 'Ana Beatriz', 'ana.b@escola.com', '2011-03-20', '2024003', id, 'active'
FROM classes WHERE name = '9º Ano A';

INSERT INTO students (name, email, birth_date, enrollment, class_id, enrollment_status)
SELECT 'Lucas Mendes', 'lucas.m@escola.com', '2011-04-18', '2024008', id, 'active'
FROM classes WHERE name = '9º Ano B';

-- Notas
INSERT INTO grades (student_id, subject_id, grade, period, evaluation_type)
SELECT s.id, sub.id, 8.5, '1º Bimestre', 'Prova'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';

INSERT INTO grades (student_id, subject_id, grade, period, evaluation_type)
SELECT s.id, sub.id, 7.0, '2º Bimestre', 'Prova'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';

INSERT INTO grades (student_id, subject_id, grade, period, evaluation_type)
SELECT s.id, sub.id, 9.0, '3º Bimestre', 'Prova'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';

INSERT INTO grades (student_id, subject_id, grade, period, evaluation_type)
SELECT s.id, sub.id, 8.0, '4º Bimestre', 'Prova'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';

-- Frequência
INSERT INTO attendance (student_id, subject_id, date, status)
SELECT s.id, sub.id, '2026-02-10', 'present'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';

INSERT INTO attendance (student_id, subject_id, date, status)
SELECT s.id, sub.id, '2026-02-11', 'present'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';

INSERT INTO attendance (student_id, subject_id, date, status)
SELECT s.id, sub.id, '2026-02-12', 'absent'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';

INSERT INTO attendance (student_id, subject_id, date, status)
SELECT s.id, sub.id, '2026-02-13', 'present'
FROM students s, subjects sub
WHERE s.enrollment = '2024001' AND sub.code = 'MAT-001';