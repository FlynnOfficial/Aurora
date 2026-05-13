const db = require('../config/database');

class Teacher {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM teachers WHERE active = true';
    const params = [];
    
    if (filters.department) {
      query += ' AND department = $' + (params.length + 1);
      params.push(filters.department);
    }
    
    if (filters.status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(filters.status);
    }
    
    query += ' ORDER BY name';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT t.*,
        COUNT(DISTINCT cs.subject_id) as subjects_count,
        COUNT(DISTINCT cs.class_id) as classes_count
       FROM teachers t
       LEFT JOIN class_subjects cs ON t.id = cs.teacher_id
       WHERE t.id = $1 AND t.active = true
       GROUP BY t.id`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM teachers WHERE email = $1 AND active = true',
      [email]
    );
    return result.rows[0];
  }

  static async create(teacherData) {
    const {
      name, email, phone, birth_date, hire_date,
      qualification, department, specialization, status
    } = teacherData;

    const result = await db.query(
      `INSERT INTO teachers (
        name, email, phone, birth_date, hire_date,
        qualification, department, specialization, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [name, email, phone, birth_date, hire_date,
       qualification, department, specialization, status || 'active']
    );
    return result.rows[0];
  }

  static async update(id, teacherData) {
    const {
      name, email, phone, birth_date,
      qualification, department, specialization, status
    } = teacherData;

    const result = await db.query(
      `UPDATE teachers 
       SET name = $1, email = $2, phone = $3, birth_date = $4,
           qualification = $5, department = $6, specialization = $7,
           status = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND active = true
       RETURNING *`,
      [name, email, phone, birth_date,
       qualification, department, specialization, status, id]
    );
    return result.rows[0];
  }

  static async deactivate(id) {
    await db.query(
      'UPDATE teachers SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  static async getSchedule(id, period = null) {
    let query = `
      SELECT cs.*, s.name as subject_name, c.name as class_name,
             sch.day_of_week, sch.start_time, sch.end_time
      FROM class_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      JOIN classes c ON cs.class_id = c.id
      LEFT JOIN schedules sch ON cs.id = sch.class_subject_id
      WHERE cs.teacher_id = $1
    `;
    const params = [id];
    
    if (period) {
      query += ' AND cs.period = $2';
      params.push(period);
    }
    
    query += ' ORDER BY sch.day_of_week, sch.start_time';
    
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Teacher;