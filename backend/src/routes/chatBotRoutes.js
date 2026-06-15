const { Router } = require('express');
const ChatBotController = require('../controllers/chatBotController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// POST /api/chatbot/message
router.post('/message', (req, res) => ChatBotController.handleMessage(req, res));

module.exports = router;