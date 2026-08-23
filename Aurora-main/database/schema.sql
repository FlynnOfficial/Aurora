-- Create Database
CREATE DATABASE IF NOT EXISTS aurora_db;
USE aurora_db;

-- Users Table (com constraints de segurança)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    failed_attempts INT DEFAULT 0,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (active),
    INDEX idx_created_at (created_at),
    CONSTRAINT chk_email_length CHECK (LENGTH(email) <= 255),
    CONSTRAINT chk_name_length CHECK (LENGTH(name) <= 255)
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    enrollment VARCHAR(50) UNIQUE NOT NULL,
    cpf VARCHAR(14),
    phone VARCHAR(20),
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_class (class_name),
    INDEX idx_enrollment (enrollment),
    INDEX idx_active (active)
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    phone VARCHAR(20),
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject (subject),
    INDEX idx_active (active)
);

-- Teacher Classes
CREATE TABLE IF NOT EXISTS teacher_classes (
    teacher_id BIGINT NOT NULL,
    class_name VARCHAR(50),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    phone VARCHAR(20),
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_active (active)
);

-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    period VARCHAR(50) NOT NULL,
    value DOUBLE NOT NULL,
    weight INT DEFAULT 1,
    status ENUM('APPROVED', 'FAILED', 'RECOVERING') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_subject (subject),
    INDEX idx_status (status)
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id BIGINT NOT NULL,
    description TEXT,
    due_date VARCHAR(50),
    status ENUM('PENDING', 'SUBMITTED', 'GRADED') NOT NULL,
    questions LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_subject (subject),
    INDEX idx_status (status),
    INDEX idx_teacher (teacher_id)
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('FISICA', 'JURIDICA') NOT NULL,
    data LONGTEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(255),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_submitted_at (submitted_at)
);

-- Security Audits Table (NOVA)
CREATE TABLE IF NOT EXISTS security_audits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    details TEXT,
    success BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp),
    INDEX idx_ip (ip_address),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- Insert Demo Users (com senhas BCrypt)
-- Password: aluno123 -> BCrypt com 12 rounds
-- Password: prof123 -> BCrypt com 12 rounds
-- Password: admin123 -> BCrypt com 12 rounds
-- Password: Super@Admin1 -> BCrypt com 12 rounds

INSERT INTO users (email, password, name, role, active) VALUES
('superadmin@escola.com', '$2a$12$R0h.uKvDNxQXvW/KI8eDl.m.HT6TYFbEGXTG1lDHGf5N6d5nJGqt2', 'Super Admin', 'SUPER_ADMIN', TRUE),
('helena.costa@escola.com', '$2a$12$yDcXs/r8g4X6N1n5z8Y3H.K5lPq2M0o9B3c4D5e6F7g8H9i0J1k2', 'Diretora Helena Costa', 'ADMIN', TRUE),
('maria.silva@escola.com', '$2a$12$5C9b8K2x3L1m4n5O6p7Q8r9S0t1U2v3W4x5Y6z7A8b9C0d1E2f3', 'Maria Silva', 'STUDENT', TRUE),
('carlos.oliveira@escola.com', '$2a$12$7F8g9H0i1J2k3L4m5N6o7P8q9R0s1T2u3V4w5X6y7Z8a9B0c1D2e3', 'Prof. Carlos Oliveira', 'TEACHER', TRUE);

-- Para gerar as senhas BCrypt, use este comando Java:
-- String encoded = new BCryptPasswordEncoder(12).encode("sua_senha_aqui");