import { useState } from 'react';
import './AdminDashboard.css';
import ChatBot from './ChatBot';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  //dados do admim
  const indicators = {
    activeStudents: { value: 1240, change: 32 },
    defaultRate: { value: 7.2, amount: 42000 },
    approvalRate: 88,
    openTickets: { value: 12, avgResponse: '2h' }
  };

  const alerts = [
    { id: 1, title: '5 alunos com faltas excessivas', type: 'warning', icon: '⚠️' },
    { id: 2, title: '3 professores com falta hoje', type: 'danger', icon: '👨‍🏫' },
    { id: 3, title: '2 contratos vencendo em 5 dias', type: 'info', icon: '📄' },
    { id: 4, title: 'Próxima reunião de pais: 10/05', type: 'success', icon: '👪' }
  ];

  const studentsList = [
    { id: 1, name: 'Ana Beatriz', enrollment: '2024001', attendance: 85, status: 'Regular' },
    { id: 2, name: 'Carlos Eduardo', enrollment: '2024002', attendance: 45, status: 'Faltas' },
    { id: 3, name: 'Fernanda Lima', enrollment: '2024003', attendance: 92, status: 'Regular' },
    { id: 4, name: 'Ricardo Alves', enrollment: '2024004', attendance: 30, status: 'Faltas' },
    { id: 5, name: 'Patrícia Souza', enrollment: '2024005', attendance: 28, status: 'Faltas' },
  ];

  const teachersList = [
    { id: 1, name: 'Prof. João Silva', subject: 'Matemática', status: 'Presente' },
    { id: 2, name: 'Profa. Maria Oliveira', subject: 'Português', status: 'Falta' },
    { id: 3, name: 'Prof. Carlos Mendes', subject: 'História', status: 'Presente' },
    { id: 4, name: 'Profa. Ana Costa', subject: 'Ciências', status: 'Falta' },
    { id: 5, name: 'Prof. Roberto Santos', subject: 'Geografia', status: 'Falta' },
  ];

  const contractsList = [
    { id: 1, name: 'Empresa X - Material Didático', dueDate: '11/04/2026', status: 'Vence em breve' },
    { id: 2, name: 'Transportadora Y', dueDate: '11/04/2026', status: 'Vence em breve' },
    { id: 3, name: 'Fornecedor Z - Merenda', dueDate: '20/04/2026', status: 'OK' },
  ];

  const ticketsList = [
    { id: 1, title: 'Problema no sistema de notas', requester: 'Prof. João', status: 'Em andamento', responseTime: '1.5h' },
    { id: 2, title: 'Trocar lâmpada sala 3', requester: 'Coordenação', status: 'Aberto', responseTime: '0.5h' },
    { id: 3, title: 'Impressora não funciona', requester: 'Secretaria', status: 'Aberto', responseTime: '2h' },
  ];

  const renderDashboard = () => (
    <>
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{indicators.activeStudents.value}</div>
          <div className="stat-label">Alunos Ativos</div>
          <span className="stat-change positive">+{indicators.activeStudents.change} no mês</span>
        </div>

        <div className="stat-card">
          <div className="stat-value">{indicators.defaultRate.value}%</div>
          <div className="stat-label">Inadimplência</div>
          <span className="stat-detail">R$ {(indicators.defaultRate.amount / 1000).toFixed(0)}k</span>
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
              {studentsList.filter(s => s.status === 'Faltas').map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>
                    <div className="attendance-bar">
                      <div className="attendance-fill" style={{width: `${student.attendance}%`}}></div>
                      <span>{student.attendance}%</span>
                    </div>
                  </td>
                  <td><span className="status-badge warning">Crítico</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="quick-card">
          <h3>Professores ausentes hoje</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Professor</th>
                <th>Disciplina</th>
              </tr>
            </thead>
            <tbody>
              {teachersList.filter(t => t.status === 'Falta').map(teacher => (
                <tr key={teacher.id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.subject}</td>
                </tr>
              ))}
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
               Dashboard
            </li>
            <li className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
               Alunos
            </li>
            <li className={activeTab === 'teachers' ? 'active' : ''} onClick={() => setActiveTab('teachers')}>
               Professores
            </li>
            <li className={activeTab === 'contracts' ? 'active' : ''} onClick={() => setActiveTab('contracts')}>
               Contratos
            </li>
            <li className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>
               Chamados
            </li>
          </ul>
        </nav>

        <button onClick={onLogout} className="logout-btn">
          ↩ Sair
        </button>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'students' && ( //renderiza aba alunos
          <div className="list-view">
            <div className="list-header">
              <h1>Gerenciamento de Alunos</h1>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>Frequência</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map(student => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.enrollment}</td>
                      <td>
                        <div className="attendance-bar">
                          <div className="attendance-fill" style={{width: `${student.attendance}%`}}></div>
                          <span>{student.attendance}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${student.status === 'Faltas' ? 'danger' : 'success'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'teachers' && ( //renderiza aba professores
          <div className="list-view">
            <div className="list-header">
              <h1>Gerenciamento de Professores</h1>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Disciplina</th>
                    <th>Status Hoje</th>
                  </tr>
                </thead>
                <tbody>
                  {teachersList.map(teacher => (
                    <tr key={teacher.id}>
                      <td>{teacher.name}</td>
                      <td>{teacher.subject}</td>
                      <td>
                        <span className={`status-badge ${teacher.status === 'Presente' ? 'success' : 'danger'}`}>
                          {teacher.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'contracts' && ( //renderiza aba fornecedores
          <div className="list-view">
            <div className="list-header">
              <h1>Contratos e Fornecedores</h1>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contrato</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contractsList.map(contract => (
                    <tr key={contract.id}>
                      <td>{contract.name}</td>
                      <td>{contract.dueDate}</td>
                      <td>
                        <span className={`status-badge ${contract.status === 'Vence em breve' ? 'warning' : 'success'}`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'tickets' && ( //renderiza aba chamdios
          <div className="list-view">
            <div className="list-header">
              <h1>Chamados Abertos</h1>
            </div>
            <div className="stats-summary">
              <div className="stat-badge">
                <span className="stat-label">Total abertos:</span>
                <span className="stat-value">{ticketsList.length}</span>
              </div>
              <div className="stat-badge">
                <span className="stat-label">Tempo médio resposta:</span>
                <span className="stat-value">{indicators.openTickets.avgResponse}</span>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Solicitante</th>
                    <th>Tempo de resposta</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsList.map(ticket => (
                    <tr key={ticket.id}>
                      <td>{ticket.title}</td>
                      <td>{ticket.requester}</td>
                      <td>{ticket.responseTime}</td>
                      <td>
                        <span className={`status-badge ${ticket.status === 'Aberto' ? 'warning' : 'info'}`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <ChatBot />
    </div>
  );
};

export default AdminDashboard;