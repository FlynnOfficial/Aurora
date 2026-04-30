import { useState } from 'react'
import './StudentDashboard.css'

function StudentDashboard({ user, onLogout }) {
  const [selectedSubject, setSelectedSubject] = useState('Matemática')
  
  //lista das disciplinas
  const subjects = ['Matemática', 'Português', 'História', 'Ciências', 'Educação Física']
  
  //dados das notas (depois eh banco de dados)
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
  }

  //funcoes auxiliares
  const calcularMediaGeral = () => {
    let soma = 0
    let total = 0
    
    Object.keys(grades).forEach(disciplina => {
      soma = soma + grades[disciplina].media
      total = total + 1
    })
    
    return (soma / total).toFixed(1)
  }

  const contarAprovacoes = () => {
    let aprovadas = 0
    const mediaCorte = 6.0
    
    for (let disciplina in grades) {
      if (grades[disciplina].media >= mediaCorte) {
        aprovadas = aprovadas + 1
      }
    }
    
    return aprovadas
  }

  const mediaGeral = calcularMediaGeral()
  const totalMaterias = subjects.length
  const aprovacoes = contarAprovacoes()
  
  //cor da media baseado no valor
  const getMediaColor = (media) => {
    if (media >= 8) return '#28a745'
    if (media >= 6) return '#ffc107'
    return '#dc3545'
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="user-info">
          <h2>{user ? user.name : 'Carregando...'}</h2>
          <p>
            {user?.grade || 'Ano não informado'} • 
            Matrícula: {user?.id || '0000'}
          </p>
          
          <span style={{ //badge de status
            backgroundColor: '#28a745',
            color: 'white',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            display: 'inline-block',
            marginTop: '10px'
          }}>
            Ativo
          </span>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className="active">Média Geral</li>
            <li>Disciplinas</li>
            <li>Aprovações</li>
            <li>Frequência</li>
          </ul>
        </nav>

        <button 
          onClick={onLogout} 
          className="logout-btn"
          style={{
            marginTop: 'auto',
            width: 'calc(100% - 40px)',
            margin: '20px'
          }}
        >
          ↩ Sair
        </button>
      </aside>

      <main className="main-content">
        <div className="stats-cards" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px'}}>
          <div className="stat-card" style={{borderLeft: `4px solid ${getMediaColor(mediaGeral)}`}}>
            <div className="stat-value" style={{fontSize: '32px', fontWeight: 'bold'}}>
              {mediaGeral}
            </div>
            <div className="stat-label">Desempenho aprovado</div>
            <small style={{color: '#665'}}>Média geral</small>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{totalMaterias}</div>
            <div className="stat-label">Total de matérias</div>
            <small style={{color: '#665'}}>Currículo 2024</small>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{aprovacoes}</div>
            <div className="stat-label">Disciplinas aprovadas</div>
            <small style={{color: '#665'}}>
              {aprovacoes === totalMaterias ? 'Parabéns! 🎉' : 'Continue estudando'}
            </small>
          </div>
        </div>

        <div className="grades-section" style={{marginTop: '40px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>Minhas Notas</h2>
            
            <select style={{padding: '5px', borderRadius: '4px'}}>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>
          
          <p className="section-subtitle">
            Acompanhe seu desempenho em todas as disciplinas
          </p>

          <div className="subjects-tabs" style={{ //abas de disciplina
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            margin: '20px 0'
          }}>
            {subjects.map((subject, index) => (
              <button
                key={subject + index}
                className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSubject(subject)
                  console.log('Selecionou disciplina:', subject)
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  background: selectedSubject === subject ? '#007bff' : 'white',
                  color: selectedSubject === subject ? 'white' : '#333',
                  cursor: 'pointer'
                }}
              >
                {subject}
              </button>
            ))}
          </div>

          {grades[selectedSubject] && ( //tabela de notas da disciplina
            <div className="subject-grades" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div className="subject-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{margin: 0}}>{selectedSubject}</h3>
                <span className="subject-media" style={{
                  backgroundColor: getMediaColor(grades[selectedSubject].media),
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  Média: {grades[selectedSubject].media}
                </span>
              </div>

              <table className="grades-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#f8f9fa'}}>
                    <th style={{padding: '12px', textAlign: 'left'}}>Período</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Nota</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Peso</th>
                    <th style={{padding: '12px', textAlign: 'left'}}>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {grades[selectedSubject].notas.map((item, index) => {
                    //calcula situacao de cada bimestre
                    const situacao = item.nota >= 6 ? '✅' : '⚠️'
                    
                    return (
                      <tr key={`${selectedSubject}-${index}`} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '12px'}}>{item.periodo}</td>
                        <td style={{padding: '12px'}}>
                          <span style={{
                            color: item.nota >= 6 ? '#28a745' : '#dc3545',
                            fontWeight: 'bold'
                          }}>
                            {item.nota}
                          </span>
                        </td>
                        <td style={{padding: '12px'}}>{item.peso}</td>
                        <td style={{padding: '12px'}}>{situacao}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard