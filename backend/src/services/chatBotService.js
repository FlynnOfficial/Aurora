const db = require('../config/database');

class ChatBotService {
  async processMessage(message, userContext) {
    try {
      const lowerMessage = message.toLowerCase();
      
      // Tentar IA primeiro (se configurada)
      if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'sk-sua-chave-aqui') {
        try {
          const aiResponse = await this.callDeepSeek(message, userContext);
          return { reply: aiResponse };
        } catch (err) {
          console.log('IA falhou, usando fallback local:', err.message);
        }
      }
      
      // Fallback: responder com dados do banco
      const localResponse = await this.generateLocalResponse(lowerMessage, userContext);
      return localResponse;
      
    } catch (error) {
      console.error('Erro geral:', error);
      return { 
        reply: '❌ Desculpe, ocorreu um erro. Tente perguntar sobre:\n\n📊 "Como estão minhas notas?"\n📅 "Qual minha frequência?"\n📚 "Quais matérias estou cursando?"' 
      };
    }
  }

  async generateLocalResponse(message, userContext) {
    // NOTAS
    if (message.includes('nota') || message.includes('média') || 
        message.includes('desempenho') || message.includes('recuperação') ||
        message.includes('aprovado') || message.includes('reprovado')) {
      return await this.getGradesResponse(userContext);
    }
    
    // FREQUÊNCIA
    if (message.includes('frequência') || message.includes('falta') || 
        message.includes('presença') || message.includes('faltei')) {
      return await this.getAttendanceResponse(userContext);
    }
    
    // MATÉRIAS
    if (message.includes('matéria') || message.includes('disciplina') || 
        message.includes('aula') || message.includes('curso')) {
      return await this.getSubjectsResponse(userContext);
    }
    
    // AJUDA
    if (message.includes('ajuda') || message.includes('oi') || 
        message.includes('olá') || message.includes('bom dia') ||
        message.includes('boa tarde') || message.includes('boa noite')) {
      return {
        reply: '👋 Olá! Sou o assistente Aurora. Posso ajudar com:\n\n📊 **Notas** - "Como estão minhas notas?"\n📅 **Frequência** - "Qual minha frequência?"\n📚 **Matérias** - "Quais matérias estou cursando?"\n\nComo posso ajudar?'
      };
    }

    // PADRÃO
    return {
      reply: '🤔 Não entendi sua pergunta. Tente:\n\n📊 "Como estão minhas notas?"\n📅 "Qual minha frequência?"\n📚 "Quais matérias estou cursando?"\n💬 "Ajuda" para ver opções'
    };
  }

  async getGradesResponse(userContext) {
    try {
      if (!userContext.studentId) {
        return { reply: '❌ Não encontrei seus dados de aluno. Faça login como aluno para ver suas notas.' };
      }

      // Buscar notas
      const grades = await db.query(`
        SELECT g.grade, g.period, s.name as subject_name
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        WHERE g.student_id = $1
        ORDER BY s.name, g.period
      `, [userContext.studentId]);

      if (grades.rows.length === 0) {
        return { reply: '📊 Você ainda não tem notas lançadas no sistema.' };
      }

      // Calcular média por matéria
      const bySubject = {};
      grades.rows.forEach(g => {
        if (!bySubject[g.subject_name]) {
          bySubject[g.subject_name] = { soma: 0, count: 0, notas: [] };
        }
        bySubject[g.subject_name].soma += parseFloat(g.grade);
        bySubject[g.subject_name].count += 1;
        bySubject[g.subject_name].notas.push(g);
      });

      // Média geral
      let totalSum = 0;
      let totalCount = 0;
      Object.values(bySubject).forEach(s => {
        totalSum += s.soma;
        totalCount += s.count;
      });
      const overallAvg = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : '0.0';

      let reply = `📊 **Suas Notas**\n\n🎯 **Média Geral: ${overallAvg}**\n\n`;

      Object.entries(bySubject).forEach(([subject, data]) => {
        const avg = (data.soma / data.count).toFixed(1);
        const emoji = avg >= 7 ? '✅' : avg >= 5 ? '⚠️' : '❌';
        reply += `${emoji} **${subject}**: ${avg}\n`;
        
        data.notas.forEach(n => {
          reply += `   📝 ${n.period}: ${parseFloat(n.grade).toFixed(1)}\n`;
        });
        reply += '\n';
      });

      // Status
      const approved = Object.entries(bySubject).filter(([, d]) => (d.soma/d.count) >= 6).length;
      const total = Object.keys(bySubject).length;
      reply += `📈 **Aprovado em ${approved}/${total} matérias**\n`;
      
      if (approved < total) {
        reply += `⚠️ **Recuperação em ${total - approved} matéria(s)**\n`;
      }

      return { reply };

    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      return { reply: '❌ Erro ao buscar notas. Tente novamente.' };
    }
  }

  async getAttendanceResponse(userContext) {
    try {
      if (!userContext.studentId) {
        return { reply: '❌ Não encontrei seus dados. Faça login como aluno.' };
      }

      const attendance = await db.query(`
        SELECT 
          COUNT(*) as total_aulas,
          COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as presencas,
          COUNT(CASE WHEN status = 'absent' THEN 1 END) as faltas
        FROM attendance
        WHERE student_id = $1
      `, [userContext.studentId]);

      const data = attendance.rows[0];
      
      if (!data || data.total_aulas == 0) {
        return { reply: '📅 Você ainda não tem registros de frequência no sistema.' };
      }

      const frequencia = ((data.presencas / data.total_aulas) * 100).toFixed(1);
      
      let reply = `📅 **Sua Frequência**\n\n`;
      reply += `📊 **Frequência: ${frequencia}%**\n`;
      reply += `✅ Presenças: ${data.presencas}\n`;
      reply += `❌ Faltas: ${data.faltas}\n`;
      reply += `📝 Total de aulas: ${data.total_aulas}\n\n`;

      if (frequencia >= 75) {
        reply += '✅ Situação: **Regular** (acima do mínimo de 75%)\n';
      } else if (frequencia >= 60) {
        reply += '⚠️ Situação: **Atenção** (próximo do limite)\n';
      } else {
        reply += '❌ Situação: **Crítico** (abaixo do mínimo)\n';
      }

      // Faltas recentes
      const recentAbsences = await db.query(`
        SELECT a.date, s.name as subject_name
        FROM attendance a
        JOIN subjects s ON a.subject_id = s.id
        WHERE a.student_id = $1 AND a.status = 'absent'
        ORDER BY a.date DESC
        LIMIT 5
      `, [userContext.studentId]);

      if (recentAbsences.rows.length > 0) {
        reply += '\n📋 **Últimas faltas:**\n';
        recentAbsences.rows.forEach(f => {
          const date = new Date(f.date).toLocaleDateString('pt-BR');
          reply += `📌 ${date} - ${f.subject_name}\n`;
        });
      }

      return { reply };

    } catch (error) {
      console.error('Erro ao buscar frequência:', error);
      return { reply: '❌ Erro ao buscar frequência.' };
    }
  }

  async getSubjectsResponse(userContext) {
    try {
      if (!userContext.studentId) {
        return { reply: '❌ Não encontrei seus dados.' };
      }

      const subjects = await db.query(`
        SELECT DISTINCT s.name, s.code
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        WHERE g.student_id = $1
      `, [userContext.studentId]);

      if (subjects.rows.length === 0) {
        return { reply: '📚 Você ainda não está matriculado em nenhuma matéria.' };
      }

      let reply = '📚 **Suas Matérias:**\n\n';
      subjects.rows.forEach(s => {
        reply += `📖 ${s.name} (${s.code})\n`;
      });
      reply += `\nTotal: ${subjects.rows.length} matérias`;

      return { reply };

    } catch (error) {
      return { reply: '❌ Erro ao buscar matérias.' };
    }
  }

  async callDeepSeek(message, userContext) {
    // Esta função só é chamada se DEEPSEEK_API_KEY estiver configurada
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Você é um assistente escolar. Responda de forma útil e amigável.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

module.exports = new ChatBotService();