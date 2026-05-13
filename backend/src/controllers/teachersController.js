const TeacherService = require('../services/teacherService');
const { validationResult } = require('express-validator');

class TeachersController {
  async index(req, res) {
    try {
      const teachers = await TeacherService.getAllTeachers(req.query);
      return res.json(teachers);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const teacher = await TeacherService.getTeacherById(req.params.id);
      return res.json(teacher);
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

      const teacher = await TeacherService.createTeacher(req.body);
      return res.status(201).json(teacher);
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

      const teacher = await TeacherService.updateTeacher(req.params.id, req.body);
      return res.json(teacher);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async destroy(req, res) {
    try {
      await TeacherService.deleteTeacher(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async schedule(req, res) {
    try {
      const schedule = await TeacherService.getTeacherSchedule(
        req.params.id,
        req.query.period
      );
      return res.json(schedule);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TeachersController();