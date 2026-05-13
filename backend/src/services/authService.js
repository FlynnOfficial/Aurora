const User = require('../models/User');
const { generateToken } = require('../config/auth');

class AuthService {
  static async login(email, password) {
    // Buscar usuário
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar senha
    const validPassword = await User.comparePassword(password, user.password);
    if (!validPassword) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token
    const token = generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  static async register(userData) {
    // Verificar se email já existe
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Criar usuário
    const user = await User.create(userData);
    
    // Gerar token
    const token = generateToken(user.id, user.role);

    return { user, token };
  }
}

module.exports = AuthService;