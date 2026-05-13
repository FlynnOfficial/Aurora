const db = require('../config/database');

class AdminController {
  async getDashboardStats(req, res) {
    try {
      // Total de alunos ativos
      const activeStudents = await db.query(
        'SELECT COUNT(*) as total FROM students WHERE active = true AND enrollment_status = $1',
        ['active']
      );

      // Novos alunos este mês
      const newStudents = await db.query(
        `SELECT COUNT(*) as total FROM students 
         WHERE created_at >= date_trunc('month', CURRENT_DATE)`
      );

      // Taxa de aprovação (alunos com média >= 6)
      const approvalRate = await db.query(`
        SELECT 
          COUNT(CASE WHEN avg_grade >= 6 THEN 1 END) * 100.0 / COUNT(*) as rate
        FROM (
          SELECT student_id, AVG(grade) as avg_grade
          FROM grades
          GROUP BY student_id
        ) sub
      `);

      // Total de professores ativos
      const activeTeachers = await db.query(
        "SELECT COUNT(*) as total FROM teachers WHERE active = true AND status = 'active'"
      );

      // Alunos em recuperação
      const studentsInRecovery = await db.query(`
        SELECT COUNT(DISTINCT student_id) as total
        FROM (
          SELECT student_id, AVG(grade) as avg_grade
          FROM grades
          GROUP BY student_id
          HAVING AVG(grade) < 6
        ) sub
      `);

      res.json({
        totalActiveStudents: parseInt(activeStudents.rows[0].total),
        newStudentsThisMonth: parseInt(newStudents.rows[0].total),
        totalActiveTeachers: parseInt(activeTeachers.rows[0].total),
        approvalRate: parseFloat(approvalRate.rows[0]?.rate || 0).toFixed(1),
        studentsInRecovery: parseInt(studentsInRecovery.rows[0].total),
        defaultRate: 0,
        defaultAmount: 0,
        openTickets: 0,
        avgResponseTime: 'N/A',
        expiringContracts: 0
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AdminController();