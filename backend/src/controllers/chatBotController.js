const chatBotService = require('../services/chatBotService');
const db = require('../config/database');

class ChatBotController {
  async handleMessage(req, res) {
    try {
      const { message } = req.body;
      const userId = req.userId;

      // Buscar dados do usuário
      const userResult = await db.query('SELECT email, role FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      if (!user) {
        return res.json({ reply: 'Usuário não encontrado.' });
      }

      const userContext = {
        userId,
        role: user.role
      };

      // Se for aluno, buscar studentId
      if (user.role === 'student') {
        const studentResult = await db.query(
          'SELECT id, name, enrollment, class_id FROM students WHERE email = $1 AND active = true',
          [user.email]
        );
        
        if (studentResult.rows[0]) {
          const student = studentResult.rows[0];
          userContext.studentId = student.id;
          userContext.studentName = student.name;
          userContext.studentEnrollment = student.enrollment;
        }
      }

      // Se for professor, buscar teacherId
      if (user.role === 'teacher') {
        const teacherResult = await db.query(
          'SELECT id, name FROM teachers WHERE email = $1 AND active = true',
          [user.email]
        );
        
        if (teacherResult.rows[0]) {
          userContext.teacherId = teacherResult.rows[0].id;
          userContext.teacherName = teacherResult.rows[0].name;
        }
      }

      console.log('Contexto:', userContext);
      console.log('Mensagem:', message);

      // Processar
      const result = await chatBotService.processMessage(message, userContext);
      res.json(result);

    } catch (error) {
      console.error('Erro no chatbot:', error);
      res.json({ 
        reply: '❌ Erro ao processar. Tente: "Como estão minhas notas?" ou "Qual minha frequência?"' 
      });
    }
  }
}

module.exports = new ChatBotController();