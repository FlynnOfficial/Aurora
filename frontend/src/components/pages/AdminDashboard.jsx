import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { studentsService } from '../../services/studentsService';
import { teachersService } from '../../services/teachersService';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';
import ChatBot from "./ChatBot";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dados do usuário
  const [user, setUser] = useState(null);
  
  // Dados reais do backend
  const [studentsList, setStudentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [indicators, setIndicators] = useState({
    activeStudents: { value: 0, change: 0 },
    defaultRate: { value: 0, amount: 0 },
    approvalRate: 0,
    openTickets: { value: 0, avgResponse: '0h' }
  });
  
  // Alertas dinâmicos
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const userData = authService.getStoredUser();
      
      // Verificar se é admin
      if (userData.role !== 'admin' && userData.role !== 'secretary') {
        navigate('/login');
        return;
      }
      
      setUser(userData);

      // Carregar dados em paralelo
      const [students, teachers, dashboardStats] = await Promise.all([
        studentsService.getAll(),
        teachersService.getAll(),
        adminService.getDashboardStats()
      ]);

      setStudentsList(students);
      setTeachersList(teachers);
      
      // Atualizar indicadores com dados reais
      setIndicators({
        activeStudents: { 
          value: dashboardStats.totalActiveStudents || students.length, 
          change: dashboardStats.newStudentsThisMonth || 0 
        },
        defaultRate: { 
          value: dashboardStats.defaultRate || 0, 
          amount: dashboardStats.defaultAmount || 0 
        },
        approvalRate: dashboardStats.approvalRate || 0,
        openTickets: { 
          value: dashboardStats.openTickets || 0, 
          avgResponse: dashboardStats.avgResponseTime || 'N/A' 
        }
      });

      // Gerar alertas baseados em dados reais
      generateAlerts(students, teachers, dashboardStats);

      setError(null);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (students, teachers, stats) => {
    const newAlerts = [];
    let alertId = 1;

    // Alunos com faltas excessivas (< 75% frequência)
    const studentsWithLowAttendance = students.filter(s => {
      // Calcular frequência baseado nos dados disponíveis
      const attendance = s.attendance_percentage || 100;
      return attendance < 75;
    });

    if (studentsWithLowAttendance.length > 0) {
      newAlerts.push({
        id: alertId++,
        title: `${studentsWithLowAttendance.length} alunos com faltas excessivas`,
        type: 'warning',
        icon: '⚠️'
      });
    }

    // Professores com status diferente de 'active'
    const teachersOnLeave = teachers.filter(t => t.status === 'on_leave');
    if (teachersOnLeave.length > 0) {
      newAlerts.push({
        id: alertId++,
        title: `${teachersOnLeave.length} professores afastados`,
        type: 'danger',
        icon: '👨‍🏫'
      });
    }

    // Contratos próximos do vencimento (do stats)
    if (stats.expiringContracts > 0) {
      newAlerts.push({
        id: alertId++,
        title: `${stats.expiringContracts} contratos vencendo em breve`,
        type: 'info',
        icon: '📄'
      });
    }

    // Reunião de pais (se houver data)
    if (stats.nextParentMeeting) {
      newAlerts.push({
        id: alertId++,
        title: `Próxima reunião de pais: ${stats.nextParentMeeting}`,
        type: 'success',
        icon: '👪'
      });
    }

    // Alunos em recuperação
    if (stats.studentsInRecovery > 0) {
      newAlerts.push({
        id: alertId++,
        title: `${stats.studentsInRecovery} alunos em recuperação`,
        type: 'warning',
        icon: '📚'
      });
    }

    setAlerts(newAlerts.length > 0 ? newAlerts : [
      { id: 1, title: 'Sistema operando normalmente', type: 'success', icon: '✅' }
    ]);
  };

  const handleLogout = () => {
    authService.logout();
  };

  // Loading e error states
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando painel administrativo...</p>
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

  const renderDashboard = () => (
    <>
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{indicators.activeStudents.value}</div>
          <div className="stat-label">Alunos Ativos</div>
          {indicators.activeStudents.change > 0 && (
            <span className="stat-change positive">+{indicators.activeStudents.change} no mês</span>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-value">{indicators.defaultRate.value}%</div>
          <div className="stat-label">Inadimplência</div>
          <span className="stat-detail">
            {indicators.defaultRate.amount > 0 
              ? `R$ ${(indicators.defaultRate.amount / 1000).toFixed(1)}k` 
              : 'Sem dados'}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-value">{indicators.approvalRate}%</div>
          <div className="stat-label">Aprovação Média</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{indicators.openTickets.value}</div>
          <div className="stat-label">Chamados Abertos</div>
          <span className="stat-detail">média {indicators.openTickets.avgResponse} resposta</span>
        </div>
      </div>

      <div className="alerts-section">
        <h2>Alertas e Ações</h2>
        <div className="alerts-grid">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card ${alert.type}`}>
              <div className="alert-icon">{alert.icon}</div>
              <div className="alert-info">
                <h4>{alert.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-view">
        <div className="quick-card">
          <h3>Alunos com mais faltas</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Frequência</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentsList
                .filter(s => (s.attendance_percentage || 100) < 75)
                .slice(0, 5)
                .map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>
                      <div className="attendance-bar">
                        <div 
                          className="attendance-fill" 
                          style={{width: `${student.attendance_percentage || 0}%`}}
                        ></div>
                        <span>{student.attendance_percentage || 0}%</span>
                      </div>
                    </td>
                    <td><span className="status-badge warning">Crítico</span></td>
                  </tr>
                ))}
              {studentsList.filter(s => (s.attendance_percentage || 100) < 75).length === 0 && (
                <tr><td colSpan="3">Nenhum aluno com faltas excessivas</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="quick-card">
          <h3>Professores Afastados</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Professor</th>
                <th>Departamento</th>
              </tr>
            </thead>
            <tbody>
              {teachersList
                .filter(t => t.status === 'on_leave' || t.status === 'retired')
                .slice(0, 5)
                .map(teacher => (
                  <tr key={teacher.id}>
                    <td>{teacher.name}</td>
                    <td>{teacher.department}</td>
                  </tr>
                ))}
              {teachersList.filter(t => t.status === 'on_leave' || t.status === 'retired').length === 0 && (
                <tr><td colSpan="2">Todos os professores ativos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="admin-info">
          <h2>{user?.name || 'Administrador'}</h2>
          <p>Gestão Escolar</p>
          <div className="admin-date">{new Date().toLocaleDateString('pt-BR')}</div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
               📊 Dashboard
            </li>
            <li className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
               👨‍🎓 Alunos
            </li>
            <li className={activeTab === 'teachers' ? 'active' : ''} onClick={() => setActiveTab('teachers')}>
               👩‍🏫 Professores
            </li>
            <li className={activeTab === 'contracts' ? 'active' : ''} onClick={() => setActiveTab('contracts')}>
               📋 Contratos
            </li>
            <li className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>
               🎫 Chamados
            </li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          ↩ Sair
        </button>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'students' && (
          <div className="list-view">
            <div className="list-header">
              <h1>Gerenciamento de Alunos</h1>
              <span className="student-count">{studentsList.length} alunos</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>Turma</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map(student => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.enrollment}</td>
                      <td>{student.class_name || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${student.enrollment_status === 'active' ? 'success' : 'warning'}`}>
                          {student.enrollment_status === 'active' ? 'Ativo' : student.enrollment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'teachers' && (
          <div className="list-view">
            <div className="list-header">
              <h1>Gerenciamento de Professores</h1>
              <span className="student-count">{teachersList.length} professores</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Departamento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teachersList.map(teacher => (
                    <tr key={teacher.id}>
                      <td>{teacher.name}</td>
                      <td>{teacher.department}</td>
                      <td>
                        <span className={`status-badge ${teacher.status === 'active' ? 'success' : 'danger'}`}>
                          {teacher.status === 'active' ? 'Ativo' : teacher.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'contracts' && (
          <div className="list-view">
            <div className="list-header">
              <h1>Contratos e Fornecedores</h1>
            </div>
            <p className="info-message">Funcionalidade em desenvolvimento</p>
          </div>
        )}
        
        {activeTab === 'tickets' && (
          <div className="list-view">
            <div className="list-header">
              <h1>Chamados Abertos</h1>
            </div>
            <p className="info-message">Funcionalidade em desenvolvimento</p>
          </div>
        )}
      </main>
      <ChatBot />
    </div>
  );
};

export default AdminDashboard;