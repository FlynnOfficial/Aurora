const { Router } = require('express');
const { body, query } = require('express-validator');
const StudentsController = require('../controllers/studentsController');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', StudentsController.index);

router.get('/:id', StudentsController.show);

router.post('/', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('enrollment').notEmpty().withMessage('Matrícula é obrigatória'),
  body('birth_date').isDate().withMessage('Data de nascimento inválida')
], StudentsController.store);

router.put('/:id', [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('enrollment_status').optional().isIn(['active', 'inactive', 'transferred', 'graduated'])
], StudentsController.update);

router.delete('/:id', StudentsController.destroy);

router.get('/:id/grades', [
  query('period').optional()
], StudentsController.grades);

router.get('/:id/attendance', [
  query('startDate').isDate(),
  query('endDate').isDate()
], StudentsController.attendance);

module.exports = router;