const Teacher = require('../models/Teacher');

class TeacherService {
  static async getAllTeachers(filters) {
    return Teacher.findAll(filters);
  }

  static async getTeacherById(id) {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new Error('Professor não encontrado');
    }
    return teacher;
  }

  static async createTeacher(teacherData) {
    const existingTeacher = await Teacher.findByEmail(teacherData.email);
    if (existingTeacher) {
      throw new Error('Email já cadastrado');
    }

    return Teacher.create(teacherData);
  }

  static async updateTeacher(id, teacherData) {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new Error('Professor não encontrado');
    }

    return Teacher.update(id, teacherData);
  }

  static async deleteTeacher(id) {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new Error('Professor não encontrado');
    }

    return Teacher.deactivate(id);
  }

  static async getTeacherSchedule(id, period) {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new Error('Professor não encontrado');
    }

    return Teacher.getSchedule(id, period);
  }
}

module.exports = TeacherService;