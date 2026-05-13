const Student = require('../models/Student');

class StudentService {
  static async getAllStudents(filters) {
    return Student.findAll(filters);
  }

  static async getStudentById(id) {
    const student = await Student.findById(id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }
    return student;
  }

  static async createStudent(studentData) {
    // Verificar se matrícula já existe
    const existingStudent = await Student.findByEnrollment(studentData.enrollment);
    if (existingStudent) {
      throw new Error('Matrícula já cadastrada');
    }

    return Student.create(studentData);
  }

  static async updateStudent(id, studentData) {
    const student = await Student.findById(id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    return Student.update(id, studentData);
  }

  static async deleteStudent(id) {
    const student = await Student.findById(id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    return Student.deactivate(id);
  }

  static async getStudentGrades(id, period) {
    const student = await Student.findById(id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    return Student.getGrades(id, period);
  }

  static async getStudentAttendance(id, startDate, endDate) {
    const student = await Student.findById(id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }

    return Student.getAttendance(id, startDate, endDate);
  }
}

module.exports = StudentService;