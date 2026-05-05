import { useState } from 'react';
import ChatBot from './ChatBot';
import './TeacherDashboard.css';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('turmas');
  const [selectedClass, setSelectedClass] = useState('9º Ano A');
  const [mostrarApenasRecuperacao, setMostrarApenasRecuperacao] = useState(false);
  
  //criar atividades
  const [newActivity, setNewActivity] = useState({ title: '', description: '', dueDate: '' });
  const [activities, setActivities] = useState([
    { id: 1, title: 'Exercício de Matemática', description: 'Resolver páginas 45 a 50', dueDate: '10/04/2026', class: '9º Ano A' },
    { id: 2, title: 'Redação', description: 'Tema: Meu futuro', dueDate: '15/04/2026', class: '9º Ano B' },
  ]);
  
  //chamada
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('pt-BR'));
  
  //lancar notas
  const [gradesData, setGradesData] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('Matemática');

  const classes = ['9º Ano A', '9º Ano B', '8º Ano A'];
  const subjects = ['Matemática', 'Português', 'História', 'Ciências', 'Geografia'];
  
  const studentsData = {
    '9º Ano A': [
      { id: 1, name: 'Maria Silva', enrollment: '2024001', grade: 8.1, status: 'Aprovado', attendance: { '06/04/2026': 'presente', '05/04/2026': 'presente' } },
      { id: 2, name: 'João Santos', enrollment: '2024002', grade: 7.3, status: 'Aprovado', attendance: { '06/04/2026': 'presente', '05/04/2026': 'falta' } },
      { id: 3, name: 'Carlos Lima', enrollment: '2024007', grade: 5.9, status: 'Recuperação', attendance: { '06/04/2026': 'falta', '05/04/2026': 'presente' } },
      { id: 4, name: 'Ana Oliveira', enrollment: '2024008', grade: 9.2, status: 'Aprovado', attendance: { '06/04/2026': 'presente', '05/04/2026': 'presente' } },
      { id: 5, name: 'Pedro Costa', enrollment: '2024009', grade: 4.8, status: 'Recuperação', attendance: { '06/04/2026': 'falta', '05/04/2026': 'falta' } },
    ],
    '9º Ano B': [
      { id: 6, name: 'Lucas Mendes', enrollment: '2024010', grade: 7.8, status: 'Aprovado', attendance: { '06/04/2026': 'presente', '05/04/2026': 'presente' } },
      { id: 7, name: 'Fernanda Rocha', enrollment: '2024011', grade: 6.5, status: 'Aprovado', attendance: { '06/04/2026': 'presente', '05/04/2026': 'presente' } },
      { id: 8, name: 'Rafael Souza', enrollment: '2024012', grade: 5.5, status: 'Recuperação', attendance: { '06/04/2026': 'falta', '05/04/2026': 'presente' } },
    ],
    '8º Ano A': [
      { id: 9, name: 'Juliana Costa', enrollment: '2024013', grade: 8.5, status: 'Aprovado', attendance: { '06/04/2026': 'presente', '05/04/2026': 'presente' } },
      { id: 10, name: 'Bruno Lima', enrollment: '2024014', grade: 7.2, status: 'Aprovado', attendance: { '06/04/2026': 'presente', '05/04/2026': 'falta' } },
    ]
  };

  //funcoes auxiliares
  const contarAlunosPorTurma = (turma) => studentsData[turma]?.length || 0;
  
  const contarAlunosRecuperacao = (turma) => {
    return studentsData[turma]?.filter(aluno => aluno.status === 'Recuperação').length || 0;
  };

  const calcularMediaTurma = (turma) => {
    if (!studentsData[turma] || studentsData[turma].length === 0) return 0;
    const soma = studentsData[turma].reduce((acc, aluno) => acc + aluno.grade, 0);
    return (soma / studentsData[turma].length).toFixed(1);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [`${selectedDate}_${studentId}`]: status
    }));
  };

  const handleGradeChange = (studentId, grade) => {
    setGradesData(prev => ({
      ...prev,
      [studentId]: parseFloat(grade)
    }));
  };

  const saveGrades = () => {
    alert('Notas salvas com sucesso!');
    console.log('Notas salvas:', gradesData);
  };

  const saveAttendance = () => {
    alert('Chamada salva com sucesso!');
    console.log('Chamada salva:', attendance);
  };

  const createActivity = () => {
    if (newActivity.title && newActivity.description) {
      setActivities(prev => [...prev, { ...newActivity, id: Date.now(), class: selectedClass }]);
      setNewActivity({ title: '', description: '', dueDate: '' });
      alert('Atividade criada com sucesso!');
    } else {
      alert('Preencha todos os campos da atividade!');
    }
  };

  //filtrar alunos
  const alunosFiltrados = () => {
    if (!studentsData[selectedClass]) return [];
    if (mostrarApenasRecuperacao) {
      return studentsData[selectedClass].filter(aluno => aluno.status === 'Recuperação');
    }
    return studentsData[selectedClass];
  };

  //renderiza aba minhasturmas
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
          <div className="stat-value">{user?.subject || 'Matéria'}</div>
          <div className="stat-label">Matéria lecionada</div>
          <small className="stat-detail">Carga horária: 40h</small>
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
                <th>Média em {user?.subject || 'Matéria'}</th>
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
    </div>
  );

  //renderiza aba criaratividades
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
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
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

  //renderiza aba listachamada
  const renderListaChamada = () => (
    <div className="chamada-section">
      <div className="chamada-header">
        <h3>Lista de Chamada - {selectedClass}</h3>
        <div className="date-selector">
          <label>Data:</label>
          <input
            type="date"
            value={selectedDate.split('/').reverse().join('-')}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split('-');
              setSelectedDate(`${day}/${month}/${year}`);
            }}
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
              const currentStatus = attendance[`${selectedDate}_${student.id}`] || 
                                   student.attendance?.[selectedDate] || 
                                   'presente';
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

  //renderiza aba lancarnotas
  const renderLancarNotas = () => (
    <div className="notas-section">
      <div className="notas-header">
        <h3>Lançar Notas - {selectedClass}</h3>
        <div className="notas-controls">
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
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

  return (
    <>
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="user-info">
            <h2>{user?.name || 'Prof. Carregando'}</h2>
            <p>{user?.subject || 'Matéria não informada'}</p>
            <small className="user-date">{new Date().toLocaleDateString('pt-BR')}</small>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'turmas' ? 'active' : ''} onClick={() => setActiveTab('turmas')}>
                 Minhas Turmas
              </li>
              <li className={activeTab === 'atividades' ? 'active' : ''} onClick={() => setActiveTab('atividades')}>
                 Criar Atividades
              </li>
              <li className={activeTab === 'chamada' ? 'active' : ''} onClick={() => setActiveTab('chamada')}>
                 Lista de Chamada
              </li>
              <li className={activeTab === 'notas' ? 'active' : ''} onClick={() => setActiveTab('notas')}>
                 Lançar Notas
              </li>
            </ul>
          </nav>

          <button onClick={onLogout} className="logout-btn">
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