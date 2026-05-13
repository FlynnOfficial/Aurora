const { Router } = require('express');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Iniciando seed...');
    console.log('Hash:', hashedPassword);

    // Limpar tudo
    await db.query('DELETE FROM attendance');
    await db.query('DELETE FROM grades');
    await db.query('DELETE FROM schedules');
    await db.query('DELETE FROM class_subjects');
    await db.query('DELETE FROM students');
    await db.query('DELETE FROM teachers');
    await db.query('DELETE FROM subjects');
    await db.query('DELETE FROM classes');
    await db.query('DELETE FROM users');

    // 1. Usuários (um por um para evitar erro de bind)
    await db.query(
      "INSERT INTO users (name, email, password, role, active) VALUES ('Daniel Ferro', 'admin@escola.com', $1, 'admin', true)",
      [hashedPassword]
    );
    await db.query(
      "INSERT INTO users (name, email, password, role, active) VALUES ('Carlos Silva', 'prof@escola.com', $1, 'teacher', true)",
      [hashedPassword]
    );
    await db.query(
      "INSERT INTO users (name, email, password, role, active) VALUES ('Ana Costa', 'sec@escola.com', $1, 'secretary', true)",
      [hashedPassword]
    );
    await db.query(
      "INSERT INTO users (name, email, password, role, active) VALUES ('Maria Silva', 'aluno@escola.com', $1, 'student', true)",
      [hashedPassword]
    );

    // 2. Turmas
    await db.query(
      "INSERT INTO classes (name, grade, shift, year, capacity) VALUES ('9 Ano A', '9 Ano', 'morning', 2026, 30)"
    );
    await db.query(
      "INSERT INTO classes (name, grade, shift, year, capacity) VALUES ('9 Ano B', '9 Ano', 'morning', 2026, 30)"
    );

    // 3. Disciplinas
    await db.query(
      "INSERT INTO subjects (name, code, description, workload) VALUES ('Matematica', 'MAT-001', 'Matematica Fundamental', 80)"
    );
    await db.query(
      "INSERT INTO subjects (name, code, description, workload) VALUES ('Portugues', 'POR-001', 'Lingua Portuguesa', 80)"
    );

    // 4. Professores
    await db.query(
      "INSERT INTO teachers (name, email, phone, hire_date, qualification, department, specialization, status) VALUES ('Carlos Silva', 'prof@escola.com', '11999990001', '2015-02-01', 'Mestrado', 'Exatas', 'Matematica', 'active')"
    );

    // 5. Buscar IDs para usar depois
    const classResult = await db.query("SELECT id FROM classes WHERE name = '9 Ano A'");
    const classId = classResult.rows[0]?.id;

    if (classId) {
      // 6. Alunos
      await db.query(
        "INSERT INTO students (name, email, birth_date, enrollment, class_id, enrollment_status) VALUES ($1, $2, $3, $4, $5, $6)",
        ['Maria Silva', 'aluno@escola.com', '2011-05-10', '2024001', classId, 'active']
      );
      await db.query(
        "INSERT INTO students (name, email, birth_date, enrollment, class_id, enrollment_status) VALUES ($1, $2, $3, $4, $5, $6)",
        ['Joao Pedro', 'aluno2@escola.com', '2011-08-15', '2024002', classId, 'active']
      );
    }

    // 7. Buscar IDs para notas
    const studentResult = await db.query("SELECT id FROM students WHERE enrollment = '2024001'");
    const subjectResult = await db.query("SELECT id FROM subjects WHERE code = 'MAT-001'");
    
    const studentId = studentResult.rows[0]?.id;
    const subjectId = subjectResult.rows[0]?.id;

    if (studentId && subjectId) {
      // 8. Notas
      await db.query(
        "INSERT INTO grades (student_id, subject_id, grade, period, evaluation_type) VALUES ($1, $2, $3, $4, $5)",
        [studentId, subjectId, 8.5, '1 Bimestre', 'Prova']
      );
      await db.query(
        "INSERT INTO grades (student_id, subject_id, grade, period, evaluation_type) VALUES ($1, $2, $3, $4, $5)",
        [studentId, subjectId, 7.0, '2 Bimestre', 'Prova']
      );
    }

    res.json({ 
      success: true,
      message: 'Banco populado!',
      usuarios: {
        admin: 'admin@escola.com / 123456',
        professor: 'prof@escola.com / 123456',
        secretaria: 'sec@escola.com / 123456',
        aluno: 'aluno@escola.com / 123456'
      }
    });

  } catch (error) {
    console.error('Erro no seed:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Rota GET para verificar usuários
router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;