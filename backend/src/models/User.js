// src/models/User.js
const bcrypt = require('bcryptjs');

// Tenta importar de diferentes caminhos
let pool;
try {
  pool = require('../db');
  console.log('✅ Pool importado de ../db');
} catch (err) {
  console.error('❌ Erro ao importar pool:', err.message);
  try {
    pool = require('./db');
    console.log('✅ Pool importado de ./db');
  } catch (err2) {
    console.error('❌ Erro ao importar pool de ./db:', err2.message);
  }
}

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, name, email, password, role, active FROM users WHERE email = $1 AND active = true',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, active FROM users WHERE id = $1 AND active = true',
      [id]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, active) VALUES ($1, $2, $3, $4, true) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    
    return result.rows[0];
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;