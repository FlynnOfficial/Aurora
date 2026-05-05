import { useState } from 'react'
import './LoginScreen.css'

function LoginScreen({ onLogin }) {
  //estados do formulario
  const [tipoUsuario, setTipoUsuario] = useState('aluno')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  //validacao
  const validarEmail = (email) => {
    return email.includes('@') && email.includes('.');
  }

  const handleSubmit = (evento) => {
    evento.preventDefault()
    
    //validacoes manuais
    if (email === '' || senha === '') {
      alert('Preencha os campos')
      return
    }
    
    if (!validarEmail(email)) {
      alert('E-mail invalido, falta um @')
      return
    }
    
    if (senha.length < 4) {
      alert('Senha muito curta, tem que ter pelo menos 4 caracteres')
      return
    }
    
    console.log('Tentando login como:', tipoUsuario)
    onLogin(email, senha, tipoUsuario)
  }

const textoBotao = tipoUsuario === 'aluno' 
    ? 'Entrar como Aluno' 
    : tipoUsuario === 'professor'
        ? 'Entrar como Professor'
        : 'Entrar como Administrador';

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sistema Escolar</h1>
          <p>Acesse seu painel com suas credenciais</p>
          
          {tipoUsuario === 'professor' && (
            <small style={{color: '#665'}}>Área restrita para professores</small>
          )}
          {tipoUsuario === 'administrador' && (
            <small style={{color: '#665'}}>Área restrita para adminstradores</small>
          )}
        </div>

        <div className="user-type-selector">
          <button
            type="button"
            className={`type-btn ${tipoUsuario === 'aluno' ? 'active' : ''}`} //seletor do tipo de usuario
            onClick={() => {
              setTipoUsuario('aluno')
              console.log('Mudou pra aluno')
            }}
          >
            Aluno
          </button>
          <button
            type="button"
            className={`type-btn ${tipoUsuario === 'professor' ? 'active' : ''}`}
            onClick={() => {
              setTipoUsuario('professor')
              console.log('Mudou pra professor')
            }}
          >
            Professor
          </button>
                    <button
            type="button"
            className={`type-btn ${tipoUsuario === 'administrador' ? 'active' : ''}`}
            onClick={() => {
              setTipoUsuario('administrador')
              console.log('Mudou pra administrador')
            }}
          >
            Administrador
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="seu.email@escola.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required //validacao
              autoComplete="off"
            />
            
            {email.length > 0 && !validarEmail(email) && (
              <small style={{color: 'orange'}}>E-mail parece incompleto</small> //mostra se o email eh valido ou nao
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              id="password"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={4} //validacao
            />
            
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)} //botao de mostrar senha
              style={{
                fontSize: '12px',
                marginTop: '5px',
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer'
              }}
            >
              
            </button>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={email === '' || senha === ''}
          >
            {textoBotao}
          </button>
        </form>

        <div className="demo-info" style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '13px'
        }}>
          <p style={{margin: '0 0 5px 0'}}><strong>Demo:</strong></p>
          <p style={{margin: '2px 0'}}>Aluno: maria.silva@escola.com / aluno123</p>
          <p style={{margin: '2px 0'}}>Professor: carlos@escola.com / prof456</p>
          <p style={{margin: '2px 0'}}>Adminstrador: daniel.ferro@escola.com / admin789</p>
          <small style={{color: '#665'}}>* qualquer email com @ funciona</small>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen