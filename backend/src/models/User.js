const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND active = true',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create({ name, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async findAll() {
    const result = await db.query(
      'SELECT id, name, email, role, active, created_at FROM users WHERE active = true ORDER BY name'
    );
    return result.rows;
  }

  static async update(id, { name, email, role }) {
    const result = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND active = true
       RETURNING id, name, email, role, updated_at`,
      [name, email, role, id]
    );
    return result.rows[0];
  }

  static async deactivate(id) {
    await db.query(
      'UPDATE users SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }
}

module.exports = User;