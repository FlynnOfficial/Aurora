-- Create Database
CREATE DATABASE IF NOT EXISTS aurora_db;
USE aurora_db;

-- Users Table (com constraints de segurança)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization_key VARCHAR(255) NOT NULL DEFAULT 'UNASSIGNED',
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

CREATE TABLE IF NOT EXISTS support_chats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    requester_id BIGINT NOT NULL,
    organization_key VARCHAR(255) NOT NULL,
    status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_support_requester (requester_id, created_at),
    INDEX idx_support_history (created_at, status)
);

CREATE TABLE IF NOT EXISTS support_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chat_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES support_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    INDEX idx_support_messages_chat (chat_id, created_at)
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

-- Subjects assigned by the administrator to each teacher
CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_key VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY uq_subject_organization_name (organization_key, name)
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    PRIMARY KEY (teacher_id, subject_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
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
    type ENUM('ADMIN') NOT NULL,
    data LONGTEXT,
    email VARCHAR(255) NOT NULL DEFAULT '',
    name VARCHAR(255) NOT NULL DEFAULT '',
    password VARCHAR(255) NOT NULL DEFAULT '',
    organization_key VARCHAR(255) NOT NULL DEFAULT 'UNASSIGNED',
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

-- Super Admins devem ser inseridos manualmente por um operador confiável.
-- Nunca coloque senhas em texto puro; gere um hash BCrypt com 12 rounds.