const StudentService = require('../services/studentService');
const { validationResult } = require('express-validator');

class StudentsController {
  async index(req, res) {
    try {
      const students = await StudentService.getAllStudents(req.query);
      return res.json(students);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const student = await StudentService.getStudentById(req.params.id);
      return res.json(student);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async store(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const student = await StudentService.createStudent(req.body);
      return res.status(201).json(student);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const student = await StudentService.updateStudent(req.params.id, req.body);
      return res.json(student);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async destroy(req, res) {
    try {
      await StudentService.deleteStudent(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async grades(req, res) {
    try {
      const grades = await StudentService.getStudentGrades(
        req.params.id,
        req.query.period
      );
      return res.json(grades);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async attendance(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const attendance = await StudentService.getStudentAttendance(
        req.params.id,
        startDate,
        endDate
      );
      return res.json(attendance);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new StudentsController();