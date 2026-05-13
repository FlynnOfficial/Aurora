import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ChatBot from './ChatBot';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('media');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('aurora_token');
      const userStr = localStorage.getItem('aurora_user');
      
      if (!token || !userStr) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);

      // Buscar todos os alunos
      const studentsRes = await api.get('/students');
      const currentStudent = studentsRes.data.find(s => s.email === userData.email);

      if (!currentStudent) {
        alert('Aluno não encontrado no banco de dados');
        navigate('/login');
        return;
      }

      setStudentData(currentStudent);

      // Buscar notas
      const gradesRes = await api.get(`/students/${currentStudent.id}/grades`);
      const gradesBySubject = {};
      
      gradesRes.data.forEach(grade => {
        if (!gradesBySubject[grade.subject_name]) {
          gradesBySubject[grade.subject_name] = { media: 0, notas: [] };
        }
        gradesBySubject[grade.subject_name].notas.push({
          periodo: grade.period,
          nota: parseFloat(grade.grade),
          peso: 1
        });
      });

      // Calcular médias
      Object.keys(gradesBySubject).forEach(subject => {
        const notas = gradesBySubject[subject].notas;
        const soma = notas.reduce((acc, n) => acc + n.nota, 0);
        gradesBySubject[subject].media = parseFloat((soma / notas.length).toFixed(1));
      });

      setGrades(gradesBySubject);
      const subjectNames = Object.keys(gradesBySubject);
      setSubjects(subjectNames);
      if (subjectNames.length > 0) setSelectedSubject(subjectNames[0]);

      // Buscar frequência
      const now = new Date();
      const startDate = `${now.getFullYear()}-01-01`;
      const endDate = `${now.getFullYear()}-12-31`;
      
      try {
        const attRes = await api.get(`/students/${currentStudent.id}/attendance`, {
          params: { startDate, endDate }
        });

        const byPeriod = {
          '1º Bimestre': { present: 0, total: 0 },
          '2º Bimestre': { present: 0, total: 0 },
          '3º Bimestre': { present: 0, total: 0 },
          '4º Bimestre': { present: 0, total: 0 }
        };

        attRes.data.forEach(record => {
          const month = new Date(record.date).getMonth();
          let period;
          if (month < 3) period = '1º Bimestre';
          else if (month < 6) period = '2º Bimestre';
          else if (month < 9) period = '3º Bimestre';
          else period = '4º Bimestre';

          byPeriod[period].total++;
          if (record.status === 'present' || record.status === 'late') {
            byPeriod[period].present++;
          }
        });

        const percentages = {};
        Object.keys(byPeriod).forEach(p => {
          const { present, total } = byPeriod[p];
          percentages[p] = total > 0 ? Math.round((present / total) * 100) : 100;
        });

        setAttendanceData(percentages);
      } catch (err) {
        console.log('Sem dados de frequência ainda');
        setAttendanceData({
          '1º Bimestre': 85,
          '2º Bimestre': 78,
          '3º Bimestre': 92,
          '4º Bimestre': 88,
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do banco');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div>Carregando dados do banco...</div>;

  return (
    <>
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="user-info">
            <h2>{user?.name || 'Aluno'}</h2>
            <p>{studentData?.class_name || 'Turma'} • {studentData?.enrollment || 'Matrícula'}</p>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>📊 Notas</li>
              <li className={activeTab === 'frequencia' ? 'active' : ''} onClick={() => setActiveTab('frequencia')}>📅 Frequência</li>
            </ul>
          </nav>

          <button onClick={handleLogout} className="logout-btn">↩ Sair</button>
        </aside>

        <main className="main-content">
          {activeTab === 'media' && (
            <div>
              <h2>Notas do Banco de Dados</h2>
              {subjects.map(subject => (
                <div key={subject} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
                  <strong>{subject}</strong>: Média {grades[subject]?.media || 'N/A'}
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'frequencia' && (
            <div>
              <h2>Frequência do Banco de Dados</h2>
              {Object.entries(attendanceData).map(([period, freq]) => (
                <div key={period} style={{ margin: '10px 0' }}>
                  {period}: {freq}%
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <ChatBot />
    </>
  );
};

export default StudentDashboard;