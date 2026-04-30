import { useState } from 'react'
import './TeacherDashboard.css'

function TeacherDashboard({ user, onLogout }) {
  const [selectedClass, setSelectedClass] = useState('9º Ano A')
  const [mostrarApenasRecuperacao, setMostrarApenasRecuperacao] = useState(false)

  const classes = ['9º Ano A', '9º Ano B', '8º Ano A']
  
  const studentsData = {
    '9º Ano A': [
      { name: 'Maria Silva', id: '2024001', grade: 8.1, status: 'Aprovado' },
      { name: 'João Santos', id: '2024002', grade: 7.3, status: 'Aprovado' },
      { name: 'Carlos Lima', id: '2024007', grade: 5.9, status: 'Recuperação' },
    ],
    '9º Ano B': [
      { name: 'Ana Oliveira', id: '2024003', grade: 9.2, status: 'Aprovado' },
      { name: 'Pedro Costa', id: '2024004', grade: 6.8, status: 'Recuperação' },
      { name: 'Mariana Souza', id: '2024008', grade: 8.2, status: 'Aprovado' },
    ],
    '8º Ano A': [
      { name: 'Julia Mendes', id: '2024005', grade: 8.5, status: 'Aprovado' },
      { name: 'Lucas Ferreira', id: '2024006', grade: 7.8, status: 'Aprovado' },
      { name: 'Beatriz Santos', id: '2024009', grade: 9.0, status: 'Aprovado' },
    ]
  }

  //funcoes auxiliares
  const contarAlunosPorTurma = (turma) => {
    if (studentsData[turma]) {
      return studentsData[turma].length
    }
    return 0
  }

  const contarAlunosRecuperacao = (turma) => {
    let count = 0
    if (studentsData[turma]) {
      for (let i = 0; i < studentsData[turma].length; i++) {
        if (studentsData[turma][i].status === 'Recuperação') {
          count++
        }
      }
    }
    return count
  }

  const calcularMediaTurma = (turma) => {
    if (!studentsData[turma] || studentsData[turma].length === 0) return 0
    
    let soma = 0
    studentsData[turma].forEach(aluno => {
      soma = soma + aluno.grade
    })
    
    return (soma / studentsData[turma].length).toFixed(1)
  }

  //total dos alunos
  let totalAlunos = 0
  for (let turma in studentsData) {
    totalAlunos = totalAlunos + studentsData[turma].length
  }

  //filtro dos alunos
  const alunosFiltrados = () => {
    if (!studentsData[selectedClass]) return []
    
    if (mostrarApenasRecuperacao) {
      return studentsData[selectedClass].filter(aluno => aluno.status === 'Recuperação')
    }
    
    return studentsData[selectedClass]
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="user-info">
          <h2>Prof. {user?.name || 'Carregando'}</h2>
          <p>{user?.subject || 'Matéria não informada'}</p>
          
          <small style={{color: '#666', display: 'block', marginTop: '10px'}}>
            {new Date().toLocaleDateString()}
          </small>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className="active">Minhas Turmas</li>
            <li>Criar Atividades</li>
            <li>Lista de Chamada</li>
            <li>Lançar Notas</li>
          </ul>
        </nav>

        <button 
          onClick={onLogout} 
          className="logout-btn"
          style={{
            margin: '20px',
            padding: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ↩ Sair
        </button>
      </aside>

      <main className="main-content">
        <div className="stats-cards" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px'}}>
          <div className="stat-card" style={{padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <div className="stat-value" style={{fontSize: '32px', fontWeight: 'bold'}}>
              {classes.length}
            </div>
            <div className="stat-label">Total de turmas</div>
            <small style={{color: '#665'}}>{Object.keys(studentsData).length} com alunos</small>
          </div>
          
          <div className="stat-card" style={{padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <div className="stat-value" style={{fontSize: '32px', fontWeight: 'bold'}}>
              {totalAlunos}
            </div>
            <div className="stat-label">Total de alunos</div>
            <small style={{color: '#665'}}>{totalAlunos} matriculados</small>
          </div>
          
          <div className="stat-card" style={{padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <div className="stat-value" style={{fontSize: '20px', fontWeight: 'bold'}}>
              {user?.subject || 'Matéria'}
            </div>
            <div className="stat-label">Matéria lecionada</div>
            <small style={{color: '#665'}}>Carga horária: 40h</small>
          </div>
        </div>

        <div className="classes-section" style={{marginTop: '40px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>Minhas Turmas</h2>
            
            <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <input 
                type="checkbox"
                checked={mostrarApenasRecuperacao} //filtro de rec
                onChange={(e) => {
                  setMostrarApenasRecuperacao(e.target.checked)
                  console.log('Filtro ativado:', e.target.checked)
                }}
              />
              Mostrar apenas recuperação
            </label>
          </div>
          
          <p className="section-subtitle">
            Visualize suas turmas e o desempenho dos alunos
          </p>

          <div className="classes-list" style={{ //lista das turmas
            display: 'flex',
            gap: '10px',
            margin: '20px 0',
            flexWrap: 'wrap'
          }}>
            {classes.map((className, index) => {
              //calcula o alerta se o aluno tiver de rec
              const temRecuperacao = contarAlunosRecuperacao(className) > 0
              
              return (
                <button
                  key={className + index} //
                  className={`class-item ${selectedClass === className ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedClass(className)
                    setMostrarApenasRecuperacao(false) //reseta o filtro
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    background: selectedClass === className ? '#007bff' : 'white',
                    color: selectedClass === className ? 'white' : '#333',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {className}
                  {temRecuperacao && selectedClass !== className && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      !
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="class-details" style={{ //detalhes da turma selecioanda
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div className="class-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{margin: '0 0 5px 0'}}>{selectedClass}</h3>
                <span className="student-count" style={{color: '#665'}}>
                  {contarAlunosPorTurma(selectedClass)} alunos • 
                  Média da turma: {calcularMediaTurma(selectedClass)}
                </span>
              </div>
              
              <div style={{textAlign: 'right'}}>
                <span style={{color: '#28a745', marginRight: '10px'}}>
                  ✅ {contarAlunosPorTurma(selectedClass) - contarAlunosRecuperacao(selectedClass)} aprovados
                </span>
                <span style={{color: '#dc3545'}}>
                  ⚠️ {contarAlunosRecuperacao(selectedClass)} recuperação
                </span>
              </div>
            </div>

            <table className="students-table" style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <th style={{padding: '12px', textAlign: 'left'}}>Aluno</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Matrícula</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Média em {user?.subject || 'Matéria'}</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados().length > 0 ? (
                  alunosFiltrados().map((student, index) => {
                    //gera iniciais pro avatar
                    const iniciais = student.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                    
                    return (
                      <tr key={`${student.id}-${index}`} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '12px'}}>
                          <div className="student-name" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span className="name-initials" style={{
                              width: '35px',
                              height: '35px',
                              borderRadius: '50%',
                              backgroundColor: '#007bff',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}>
                              {iniciais}
                            </span>
                            {student.name}
                          </div>
                        </td>
                        <td style={{padding: '12px'}}>{student.id}</td>
                        <td style={{padding: '12px'}}>
                          <span style={{
                            color: student.grade >= 6 ? '#28a745' : '#dc3545',
                            fontWeight: 'bold'
                          }}>
                            {student.grade}
                          </span>
                        </td>
                        <td style={{padding: '12px'}}>
                          <span className={`status-badge ${student.status === 'Aprovado' ? 'approved' : 'recovery'}`} style={{
                            padding: '5px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: student.status === 'Aprovado' ? '#d4edda' : '#fff3cd',
                            color: student.status === 'Aprovado' ? '#155724' : '#856404'
                          }}>
                            {student.status}
                          </span>
                        </td>
                        <td style={{padding: '12px'}}>
                          <button 
                            style={{
                              padding: '5px 10px',
                              backgroundColor: 'transparent',
                              border: '1px solid #007bff',
                              color: '#007bff',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            onClick={() => {
                              alert(`Abrindo detalhes de ${student.name}`)
                            }}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#665'}}>
                      {mostrarApenasRecuperacao ? 
                        'Nenhum aluno em recuperação nessa turma! 🎉' : 
                        'Nenhum aluno encontrado'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TeacherDashboard