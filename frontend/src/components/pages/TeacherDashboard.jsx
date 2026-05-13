import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { teachersService } from '../../services/teachersService';
import { studentsService } from '../../services/studentsService';
import ChatBot from "./ChatBot";
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('turmas');
  const [selectedClass, setSelectedClass] = useState(null);
  const [mostrarApenasRecuperacao, setMostrarApenasRecuperacao] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dados reais do backend
  const [user, setUser] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [studentsData, setStudentsData] = useState({});
  const [schedule, setSchedule] = useState([]);
  
  // Criar atividades
  const [newActivity, setNewActivity] = useState({ title: '', description: '', dueDate: '' });
  const [activities, setActivities] = useState([]);
  
  // Chamada
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Lançar notas
  const [gradesData, setGradesData] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedClass && teacherData) {
      loadStudentsFromClass(selectedClass);
    }
  }, [selectedClass]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const userData = authService.getStoredUser();
      setUser(userData);

      // Buscar dados do professor pelo email
      const allTeachers = await teachersService.getAll();
      const currentTeacher = allTeachers.find(t => t.email === userData.email);
      
      if (!currentTeacher) {
        setError('Professor não encontrado no sistema');
        setLoading(false);
        return;
      }

      setTeacherData(currentTeacher);

      // Carregar horários do professor para extrair turmas e matérias
      const scheduleData = await teachersService.getSchedule(currentTeacher.id);
      setSchedule(scheduleData);

      // Extrair turmas únicas dos horários
      const uniqueClasses = [...new Set(scheduleData.map(s => s.class_name))];
      setClasses(uniqueClasses);
      
      // Extrair matérias únicas
      const uniqueSubjects = [...new Set(scheduleData.map(s => s.subject_name))];
      setSubjects(uniqueSubjects);
      
      // Selecionar primeira turma e primeira matéria
      if (uniqueClasses.length > 0) {
        setSelectedClass(uniqueClasses[0]);
      }
      if (uniqueSubjects.length > 0) {
        setSelectedSubject(uniqueSubjects[0]);
      }

      // Carregar todas as turmas de uma vez
      if (uniqueClasses.length > 0) {
        await loadAllClasses(uniqueClasses);
      }

      setError(null);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllClasses = async (classNames) => {
    try {
      // Buscar todos os alunos
      const allStudents = await studentsService.getAll();
      
      // Organizar por turma
      const studentsByClass = {};
      
      for (const className of classNames) {
        const studentsInClass = allStudents.filter(s => s.class_name === className);
        
        // Para cada aluno, buscar notas
        const studentsWithGrades = await Promise.all(
          studentsInClass.map(async (student) => {
            try {
              const grades = await studentsService.getGrades(student.id);
              
              // Calcular média geral
              let mediaGeral = 0;
              if (grades.length > 0) {
                const soma = grades.reduce((acc, g) => acc + parseFloat(g.grade), 0);
                mediaGeral = parseFloat((soma / grades.length).toFixed(1));
              }
              
              return {
                ...student,
                grade: mediaGeral,
                status: mediaGeral >= 6 ? 'Aprovado' : 'Recuperação'
              };
            } catch (err) {
              console.error(`Erro ao carregar notas do aluno ${student.id}:`, err);
              return {
                ...student,
                grade: 0,
                status: 'Sem notas'
              };
            }
          })
        );
        
        studentsByClass[className] = studentsWithGrades;
      }
      
      setStudentsData(studentsByClass);
    } catch (err) {
      console.error('Erro ao carregar turmas:', err);
    }
  };

  const loadStudentsFromClass = async (className) => {
    if (studentsData[className]) return; // Já carregado
    
    try {
      const allStudents = await studentsService.getAll();
      const studentsInClass = allStudents.filter(s => s.class_name === className);
      
      const studentsWithGrades = await Promise.all(
        studentsInClass.map(async (student) => {
          try {
            const grades = await studentsService.getGrades(student.id);
            let mediaGeral = 0;
            if (grades.length > 0) {
              const soma = grades.reduce((acc, g) => acc + parseFloat(g.grade), 0);
              mediaGeral = parseFloat((soma / grades.length).toFixed(1));
            }
            
            return {
              ...student,
              grade: mediaGeral,
              status: mediaGeral >= 6 ? 'Aprovado' : 'Recuperação'
            };
          } catch (err) {
            return { ...student, grade: 0, status: 'Sem notas' };
          }
        })
      );
      
      setStudentsData(prev => ({
        ...prev,
        [className]: studentsWithGrades
      }));
    } catch (err) {
      console.error('Erro ao carregar alunos da turma:', err);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  // Funções auxiliares
  const contarAlunosPorTurma = (turma) => studentsData[turma]?.length || 0;
  
  const contarAlunosRecuperacao = (turma) => {
    return studentsData[turma]?.filter(aluno => aluno.status === 'Recuperação').length || 0;
  };

  const calcularMediaTurma = (turma) => {
    if (!studentsData[turma] || studentsData[turma].length === 0) return '0.0';
    const alunosComNota = studentsData[turma].filter(a => a.grade > 0);
    if (alunosComNota.length === 0) return '0.0';
    const soma = alunosComNota.reduce((acc, aluno) => acc + aluno.grade, 0);
    return (soma / alunosComNota.length).toFixed(1);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleGradeChange = (studentId, grade) => {
    setGradesData(prev => ({
      ...prev,
      [studentId]: parseFloat(grade)
    }));
  };

  const saveGrades = async () => {
    try {
      // Aqui você pode implementar a chamada para salvar notas no backend
      // Por enquanto, apenas feedback
      alert('Notas salvas com sucesso! (Implementar endpoint de salvamento)');
      console.log('Notas para salvar:', gradesData);
    } catch (err) {
      alert('Erro ao salvar notas: ' + err.message);
    }
  };

  const saveAttendance = async () => {
    try {
      // Aqui você pode implementar a chamada para salvar frequência no backend
      // Por enquanto, apenas feedback
      alert('Chamada salva com sucesso! (Implementar endpoint de salvamento)');
      console.log('Chamada para salvar:', attendance, 'Data:', selectedDate);
    } catch (err) {
      alert('Erro ao salvar chamada: ' + err.message);
    }
  };

  const createActivity = () => {
    if (newActivity.title && newActivity.description) {
      setActivities(prev => [...prev, { 
        ...newActivity, 
        id: Date.now(), 
        class: selectedClass 
      }]);
      setNewActivity({ title: '', description: '', dueDate: '' });
      alert('Atividade criada com sucesso!');
    } else {
      alert('Preencha todos os campos da atividade!');
    }
  };

  const alunosFiltrados = () => {
    if (!studentsData[selectedClass]) return [];
    if (mostrarApenasRecuperacao) {
      return studentsData[selectedClass].filter(aluno => aluno.status === 'Recuperação');
    }
    return studentsData[selectedClass];
  };

  // Loading e error states
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando dados do professor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={loadDashboardData}>Tentar novamente</button>
        <button onClick={handleLogout}>Voltar para login</button>
      </div>
    );
  }

  // Renderizações das abas
  const renderMinhasTurmas = () => (
    <div className="classes-section">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{classes.length}</div>
          <div className="stat-label">Total de turmas</div>
          <small className="stat-detail">Atribuídas para você</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.values(studentsData).flat().length}</div>
          <div className="stat-label">Total de alunos</div>
          <small className="stat-detail">Matriculados</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">{subjects.length}</div>
          <div className="stat-label">Matérias lecionadas</div>
          <small className="stat-detail">{subjects.join(', ')}</small>
        </div>
      </div>

      <div className="classes-list">
        {classes.map((className) => {
          const temRecuperacao = contarAlunosRecuperacao(className) > 0;
          return (
            <button
              key={className}
              className={`class-item ${selectedClass === className ? 'active' : ''}`}
              onClick={() => {
                setSelectedClass(className);
                setMostrarApenasRecuperacao(false);
              }}
            >
              {className}
              {temRecuperacao && selectedClass !== className && (
                <span className="recovery-badge">!</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedClass && (
        <div className="class-details">
          <div className="class-header">
            <div>
              <h3>{selectedClass}</h3>
              <span className="student-count">
                {contarAlunosPorTurma(selectedClass)} alunos • 
                Média da turma: {calcularMediaTurma(selectedClass)}
              </span>
            </div>
            <div className="class-stats">
              <span className="approved-count">
                ✅ {contarAlunosPorTurma(selectedClass) - contarAlunosRecuperacao(selectedClass)} Aprovados
              </span>
              <span className="recovery-count">
                ⚠️ {contarAlunosRecuperacao(selectedClass)} Recuperação
              </span>
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-checkbox">
              <input 
                type="checkbox"
                checked={mostrarApenasRecuperacao}
                onChange={(e) => setMostrarApenasRecuperacao(e.target.checked)}
              />
              Mostrar apenas recuperação
            </label>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th>Média Geral</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados().map((student) => {
                  const iniciais = student.name.split(' ').map(n => n[0]).join('').substring(0, 2);
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-name">
                          <span className="name-initials">{iniciais}</span>
                          {student.name}
                        </div>
                      </td>
                      <td>{student.enrollment}</td>
                      <td>
                        <span className={`grade-value ${student.grade >= 6 ? 'approved-grade' : 'recovery-grade'}`}>
                          {student.grade}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${student.status === 'Aprovado' ? 'approved' : 'recovery'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderCriarAtividades = () => (
    <div className="atividades-section">
      <div className="form-card">
        <h3>Criar Nova Atividade</h3>
        <div className="form-group">
          <label>Título da Atividade</label>
          <input
            type="text"
            placeholder="Ex: Exercício de Matemática"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <textarea
            placeholder="Descreva a atividade..."
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Data de Entrega</label>
          <input
            type="date"
            value={newActivity.dueDate}
            onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Turma</label>
          <select value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value)}>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="primary-btn" onClick={createActivity}>Criar Atividade</button>
      </div>

      <div className="activities-list">
        <h3>Atividades Recentes</h3>
        {activities.filter(a => a.class === selectedClass).length === 0 ? (
          <div className="no-activities">Nenhuma atividade criada para esta turma</div>
        ) : (
          activities.filter(a => a.class === selectedClass).map(activity => (
            <div key={activity.id} className="activity-card">
              <div className="activity-header">
                <h4>{activity.title}</h4>
                <span className="activity-date"> {activity.dueDate}</span>
              </div>
              <p>{activity.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderListaChamada = () => (
    <div className="chamada-section">
      <div className="chamada-header">
        <h3>Lista de Chamada - {selectedClass}</h3>
        <div className="date-selector">
          <label>Data:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="secondary-btn" onClick={saveAttendance}>Salvar Chamada</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Matrícula</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {studentsData[selectedClass]?.map(student => {
              const currentStatus = attendance[student.id] || 'presente';
              return (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.enrollment}</td>
                  <td>
                    <span className={`attendance-status ${currentStatus}`}>
                      {currentStatus === 'presente' ? ' Presente' : ' Falta'}
                    </span>
                  </td>
                  <td>
                    <div className="attendance-buttons">
                      <button 
                        className={`attendance-btn present ${currentStatus === 'presente' ? 'active' : ''}`}
                        onClick={() => handleAttendanceChange(student.id, 'presente')}
                      >
                        Presente
                      </button>
                      <button 
                        className={`attendance-btn absent ${currentStatus === 'falta' ? 'active' : ''}`}
                        onClick={() => handleAttendanceChange(student.id, 'falta')}
                      >
                        Falta
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLancarNotas = () => (
    <div className="notas-section">
      <div className="notas-header">
        <h3>Lançar Notas - {selectedClass}</h3>
        <div className="notas-controls">
          <select value={selectedSubject || ''} onChange={(e) => setSelectedSubject(e.target.value)}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="primary-btn" onClick={saveGrades}>Salvar Notas</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Matrícula</th>
              <th>Nota Anterior</th>
              <th>Nova Nota</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {studentsData[selectedClass]?.map(student => {
              const currentGrade = gradesData[student.id] || student.grade;
              return (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.enrollment}</td>
                  <td>{student.grade}</td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="grade-input"
                      value={currentGrade}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <span className={`status-badge ${currentGrade >= 6 ? 'approved' : 'recovery'}`}>
                      {currentGrade >= 6 ? 'Aprovado' : 'Recuperação'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Calcular horários do dia atual
  const todaySchedule = schedule.filter(s => {
    const today = new Date().getDay();
    return s.day_of_week === today;
  });

  return (
    <>
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="user-info">
            <h2>{user?.name || 'Professor'}</h2>
            <p>{teacherData?.department || 'Departamento'}</p>
            <small className="user-date">
              {new Date().toLocaleDateString('pt-BR')}
            </small>
            {todaySchedule.length > 0 && (
              <div className="today-schedule">
                <small>Hoje:</small>
                {todaySchedule.map((s, i) => (
                  <small key={i}>{s.subject_name} - {s.class_name}</small>
                ))}
              </div>
            )}
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'turmas' ? 'active' : ''} onClick={() => setActiveTab('turmas')}>
                 📚 Minhas Turmas
              </li>
              <li className={activeTab === 'atividades' ? 'active' : ''} onClick={() => setActiveTab('atividades')}>
                 ✏️ Criar Atividades
              </li>
              <li className={activeTab === 'chamada' ? 'active' : ''} onClick={() => setActiveTab('chamada')}>
                 📋 Lista de Chamada
              </li>
              <li className={activeTab === 'notas' ? 'active' : ''} onClick={() => setActiveTab('notas')}>
                 📝 Lançar Notas
              </li>
            </ul>
          </nav>

          <button onClick={handleLogout} className="logout-btn">
            ↩ Sair
          </button>
        </aside>

        <main className="main-content">
          {activeTab === 'turmas' && renderMinhasTurmas()}
          {activeTab === 'atividades' && renderCriarAtividades()}
          {activeTab === 'chamada' && renderListaChamada()}
          {activeTab === 'notas' && renderLancarNotas()}
        </main>
      </div>
      <ChatBot />
    </>
  );
};

export default TeacherDashboard;