const { Router } = require('express');
const { body } = require('express-validator');
const TeachersController = require('../controllers/teachersController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/', TeachersController.index);

router.get('/:id', TeachersController.show);

router.post('/', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').optional(),
  body('qualification').notEmpty().withMessage('Qualificação é obrigatória'),
  body('department').notEmpty().withMessage('Departamento é obrigatório')
], TeachersController.store);

router.put('/:id', [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('status').optional().isIn(['active', 'on_leave', 'retired'])
], TeachersController.update);

router.delete('/:id', TeachersController.destroy);

router.get('/:id/schedule', TeachersController.schedule);

module.exports = router;