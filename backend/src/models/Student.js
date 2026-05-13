const db = require('../config/database');

class Student {
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*, 
        c.name as class_name,
        c.grade as class_grade
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.active = true
    `;
    const params = [];
    
    if (filters.class_id) {
      query += ' AND s.class_id = $' + (params.length + 1);
      params.push(filters.class_id);
    }
    
    if (filters.enrollment_status) {
      query += ' AND s.enrollment_status = $' + (params.length + 1);
      params.push(filters.enrollment_status);
    }
    
    query += ' ORDER BY s.name';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT s.*, 
        c.name as class_name,
        c.grade as class_grade
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = $1 AND s.active = true`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEnrollment(enrollment) {
    const result = await db.query(
      'SELECT * FROM students WHERE enrollment = $1 AND active = true',
      [enrollment]
    );
    return result.rows[0];
  }

  static async create(studentData) {
    const {
      name, email, birth_date, enrollment, class_id,
      guardian_name, guardian_phone, guardian_email,
      address, phone, enrollment_status
    } = studentData;

    const result = await db.query(
      `INSERT INTO students (
        name, email, birth_date, enrollment, class_id,
        guardian_name, guardian_phone, guardian_email,
        address, phone, enrollment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [name, email, birth_date, enrollment, class_id,
       guardian_name, guardian_phone, guardian_email,
       address, phone, enrollment_status || 'active']
    );
    return result.rows[0];
  }

  static async update(id, studentData) {
    const {
      name, email, birth_date, class_id,
      guardian_name, guardian_phone, guardian_email,
      address, phone, enrollment_status
    } = studentData;

    const result = await db.query(
      `UPDATE students 
       SET name = $1, email = $2, birth_date = $3, class_id = $4,
           guardian_name = $5, guardian_phone = $6, guardian_email = $7,
           address = $8, phone = $9, enrollment_status = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND active = true
       RETURNING *`,
      [name, email, birth_date, class_id,
       guardian_name, guardian_phone, guardian_email,
       address, phone, enrollment_status, id]
    );
    return result.rows[0];
  }

  static async deactivate(id) {
    await db.query(
      'UPDATE students SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  static async getGrades(id, period = null) {
    let query = `
      SELECT g.*, s.name as subject_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.student_id = $1
    `;
    const params = [id];
    
    if (period) {
      query += ' AND g.period = $2';
      params.push(period);
    }
    
    query += ' ORDER BY g.period DESC, s.name';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async getAttendance(id, startDate, endDate) {
    const result = await db.query(
      `SELECT a.*, s.name as subject_name
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.student_id = $1
       AND a.date BETWEEN $2 AND $3
       ORDER BY a.date DESC`,
      [id, startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = Student;