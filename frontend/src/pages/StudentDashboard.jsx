import { useState } from 'react';
import ChatBot from '../../pages/ChatBot';
import './StudentDashboard.css';

const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('media');
  const [selectedSubject, setSelectedSubject] = useState('Matemática');
  
  const subjects = ['Matemática', 'Português', 'História', 'Ciências', 'Educação Física'];
  
  const grades = {
    'Matemática': {
      media: 8.1,
      notas: [
        { periodo: '1º Bimestre', nota: 8.5, peso: 1 },
        { periodo: '2º Bimestre', nota: 7.0, peso: 1 },
        { periodo: '3º Bimestre', nota: 9.0, peso: 1 },
        { periodo: '4º Bimestre', nota: 8.0, peso: 1 },
      ]
    },
    'Português': {
      media: 7.5,
      notas: [
        { periodo: '1º Bimestre', nota: 7.0, peso: 1 },
        { periodo: '2º Bimestre', nota: 8.0, peso: 1 },
        { periodo: '3º Bimestre', nota: 7.5, peso: 1 },
        { periodo: '4º Bimestre', nota: 7.5, peso: 1 },
      ]
    },
    'História': {
      media: 8.8,
      notas: [
        { periodo: '1º Bimestre', nota: 9.0, peso: 1 },
        { periodo: '2º Bimestre', nota: 8.5, peso: 1 },
        { periodo: '3º Bimestre', nota: 9.0, peso: 1 },
        { periodo: '4º Bimestre', nota: 8.7, peso: 1 },
      ]
    },
    'Ciências': {
      media: 6.5,
      notas: [
        { periodo: '1º Bimestre', nota: 6.0, peso: 1 },
        { periodo: '2º Bimestre', nota: 7.0, peso: 1 },
        { periodo: '3º Bimestre', nota: 6.5, peso: 1 },
        { periodo: '4º Bimestre', nota: 6.5, peso: 1 },
      ]
    },
    'Educação Física': {
      media: 9.2,
      notas: [
        { periodo: '1º Bimestre', nota: 9.0, peso: 1 },
        { periodo: '2º Bimestre', nota: 9.5, peso: 1 },
        { periodo: '3º Bimestre', nota: 9.0, peso: 1 },
        { periodo: '4º Bimestre', nota: 9.3, peso: 1 },
      ]
    }
  };

  const attendanceData = {
    '1º Bimestre': 85,
    '2º Bimestre': 78,
    '3º Bimestre': 92,
    '4º Bimestre': 88,
  };

  const calcularMediaGeral = () => {
    let soma = 0;
    let total = 0;
    
    Object.keys(grades).forEach(disciplina => {
      soma = soma + grades[disciplina].media;
      total = total + 1;
    });
    
    return (soma / total).toFixed(1);
  };

  const contarAprovacoes = () => {
    let aprovadas = 0;
    const mediaCorte = 6.0;
    
    for (let disciplina in grades) {
      if (grades[disciplina].media >= mediaCorte) {
        aprovadas = aprovadas + 1;
      }
    }
    
    return aprovadas;
  };

  const contarReprovacoes = () => {
    let reprovadas = 0;
    const mediaCorte = 6.0;
    
    for (let disciplina in grades) {
      if (grades[disciplina].media < mediaCorte) {
        reprovadas = reprovadas + 1;
      }
    }
    
    return reprovadas;
  };

  const mediaGeral = calcularMediaGeral();
  const totalMaterias = subjects.length;
  const aprovacoes = contarAprovacoes();
  const reprovacoes = contarReprovacoes();
  const mediaFrequencia = Object.values(attendanceData).reduce((a, b) => a + b, 0) / Object.values(attendanceData).length;
  
  const getMediaColor = (media) => {
    if (media >= 8) return '#28a745';
    if (media >= 6) return '#ffc107';
    return '#dc3545';
  };

  const getFrequenciaColor = (frequencia) => {
    if (frequencia >= 75) return '#28a745';
    if (frequencia >= 60) return '#ffc107';
    return '#dc3545';
  };

  //renderiza aba mediageral
  const renderMediaGeral = () => (
    <div className="grades-section">
      <div className="stats-cards">
        <div className="stat-card" style={{borderLeft: `4px solid ${getMediaColor(mediaGeral)}`}}>
          <div className="stat-value">{mediaGeral}</div>
          <div className="stat-label">Média Geral</div>
          <small className="stat-detail">Desempenho anual</small>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{totalMaterias}</div>
          <div className="stat-label">Total de matérias</div>
          <small className="stat-detail">Currículo 2024</small>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{aprovacoes}</div>
          <div className="stat-label">Disciplinas aprovadas</div>
          <small className="stat-detail">
            {aprovacoes === totalMaterias ? 'Parabéns pela conclusão!' : `Faltam ${totalMaterias - aprovacoes} para conclusão`}
          </small>
        </div>
      </div>

      <div className="subjects-tabs">
        {subjects.map((subject) => (
          <button
            key={subject}
            className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
            onClick={() => setSelectedSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      {grades[selectedSubject] && (
        <div className="subject-grades">
          <div className="subject-header">
            <h3>{selectedSubject}</h3>
            <span className="subject-media" style={{backgroundColor: getMediaColor(grades[selectedSubject].media)}}>
              Média: {grades[selectedSubject].media}
            </span>
          </div>

          <table className="grades-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Nota</th>
                <th>Peso</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {grades[selectedSubject].notas.map((item, index) => {
                const situacao = item.nota >= 6 ? '✅ Aprovado' : '⚠️ Recuperação';
                return (
                  <tr key={index}>
                    <td>{item.periodo}</td>
                    <td>
                      <span style={{color: item.nota >= 6 ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>
                        {item.nota}
                      </span>
                    </td>
                    <td>{item.peso}</td>
                    <td>{situacao}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  //renderiza aba disciplinas
  const renderDisciplinas = () => (
    <div className="disciplinas-section">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{totalMaterias}</div>
          <div className="stat-label">Total de Disciplinas</div>
          <small className="stat-detail">Cursando no ano letivo</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">{aprovacoes}</div>
          <div className="stat-label">Aprovadas</div>
          <small className="stat-detail">Média ≥ 6.0</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">{reprovacoes}</div>
          <div className="stat-label">Em Recuperação</div>
          <small className="stat-detail">Média &lt; 6.0</small>
        </div>
      </div>

      <div className="disciplinas-list">
        {subjects.map(subject => (
          <div key={subject} className="disciplina-card">
            <div className="disciplina-header">
              <h4>{subject}</h4>
              <span className={`disciplina-status ${grades[subject].media >= 6 ? 'approved' : 'recovery'}`}>
                {grades[subject].media >= 6 ? 'Aprovado' : 'Recuperação'}
              </span>
            </div>
            <div className="disciplina-media">
              <span className="media-label">Média final:</span>
              <span className="media-value" style={{color: getMediaColor(grades[subject].media)}}>
                {grades[subject].media}
              </span>
            </div>
            <div className="disciplina-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${(grades[subject].media / 10) * 100}%`, backgroundColor: getMediaColor(grades[subject].media)}}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  //renderiza aba aprovacoes
  const renderAprovacoes = () => (
    <div className="aprovacoes-section">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{aprovacoes}</div>
          <div className="stat-label">Aprovadas</div>
          <small className="stat-detail">Disciplinas</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">{reprovacoes}</div>
          <div className="stat-label">Recuperação</div>
          <small className="stat-detail">Disciplinas</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">{((aprovacoes / totalMaterias) * 100).toFixed(0)}%</div>
          <div className="stat-label">Taxa de Aprovação</div>
          <small className="stat-detail">Geral</small>
        </div>
      </div>

      <div className="aprovacoes-resumo">
        <h3>Resumo de Desempenho</h3>
        <div className="progress-circle-container">
          <div className="progress-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10"/>
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="#28a745" strokeWidth="10"
                strokeDasharray={`${((aprovacoes / totalMaterias) * 283)} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="circle-text">
              <span className="circle-percent">{((aprovacoes / totalMaterias) * 100).toFixed(0)}%</span>
              <span className="circle-label">Aprovação</span>
            </div>
          </div>
        </div>
        
        <div className="aprovacoes-lista">
          <div className="aprovadas-lista">
            <h4>✅ Disciplinas Aprovadas ({aprovacoes})</h4>
            <ul>
              {subjects.filter(s => grades[s].media >= 6).map(s => (
                <li key={s}>{s} - Média: {grades[s].media}</li>
              ))}
            </ul>
          </div>
          {reprovacoes > 0 && (
            <div className="recuperacao-lista">
              <h4>⚠️ Disciplinas em Recuperação ({reprovacoes})</h4>
              <ul>
                {subjects.filter(s => grades[s].media < 6).map(s => (
                  <li key={s}>{s} - Média: {grades[s].media}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  //renderiza aba frequencia
  const renderFrequencia = () => (
    <div className="frequencia-section">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{mediaFrequencia.toFixed(0)}%</div>
          <div className="stat-label">Média de Frequência</div>
          <small className="stat-detail">Ano letivo</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mediaFrequencia >= 75 ? '✅' : '⚠️'}</div>
          <div className="stat-label">Situação</div>
          <small className="stat-detail">{mediaFrequencia >= 75 ? 'Aprovado por frequência' : 'Risco de reprovação'}</small>
        </div>
        <div className="stat-card">
          <div className="stat-value">75%</div>
          <div className="stat-label">Mínimo Necessário</div>
          <small className="stat-detail">Para aprovação</small>
        </div>
      </div>

      <div className="frequencia-grafico">
        <h3>Frequência por Bimestre</h3>
        <div className="bimestres-grid">
          {Object.entries(attendanceData).map(([bimestre, frequencia]) => (
            <div key={bimestre} className="bimestre-card">
              <div className="bimestre-label">{bimestre}</div>
              <div className="bimestre-bar-container">
                <div 
                  className="bimestre-bar" 
                  style={{height: `${frequencia}%`, backgroundColor: getFrequenciaColor(frequencia)}}
                ></div>
              </div>
              <div className="bimestre-value" style={{color: getFrequenciaColor(frequencia)}}>
                {frequencia}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="frequencia-detalhes">
        <h3>Detalhamento</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Bimestre</th>
              <th>Frequência</th>
              <th>Faltas</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(attendanceData).map(([bimestre, frequencia]) => {
              const faltas = 100 - frequencia;
              const aulasTotais = 80;
              const faltasCount = Math.round((faltas / 100) * aulasTotais);
              return (
                <tr key={bimestre}>
                  <td>{bimestre}</td>
                  <td>
                    <div className="attendance-bar">
                      <div className="attendance-fill" style={{width: `${frequencia}%`, backgroundColor: getFrequenciaColor(frequencia)}}></div>
                      <span>{frequencia}%</span>
                    </div>
                  </td>
                  <td>{faltasCount} faltas</td>
                  <td>
                    <span className={`status-badge ${frequencia >= 75 ? 'success' : 'danger'}`}>
                      {frequencia >= 75 ? ' Regular' : ' Insuficiente'}
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
            <h2>{user?.name || 'Carregando...'}</h2>
            <p>9º Ano A • Matrícula: 2024001</p>
            <span className="status-badge success" style={{display: 'inline-block', marginTop: '10px'}}>
              Ativo
            </span>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>
                 Média Geral
              </li>
              <li className={activeTab === 'disciplinas' ? 'active' : ''} onClick={() => setActiveTab('disciplinas')}>
                 Disciplinas
              </li>
              <li className={activeTab === 'aprovacoes' ? 'active' : ''} onClick={() => setActiveTab('aprovacoes')}>
                 Aprovações
              </li>
              <li className={activeTab === 'frequencia' ? 'active' : ''} onClick={() => setActiveTab('frequencia')}>
                 Frequência
              </li>
            </ul>
          </nav>

          <button onClick={onLogout} className="logout-btn">
            ↩ Sair
          </button>
        </aside>

        <main className="main-content">
          {activeTab === 'media' && renderMediaGeral()}
          {activeTab === 'disciplinas' && renderDisciplinas()}
          {activeTab === 'aprovacoes' && renderAprovacoes()}
          {activeTab === 'frequencia' && renderFrequencia()}
        </main>
      </div>
      <ChatBot />
    </>
  );
};

export default StudentDashboard;