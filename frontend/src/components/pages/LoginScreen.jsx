import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './LoginScreen.css'

function LoginScreen() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (evento) => {
    evento.preventDefault()
    setErro('')
    
    if (email === '' || senha === '') {
      setErro('Preencha todos os campos')
      return
    }
    
    if (senha.length < 4) {
      setErro('Senha muito curta')
      return
    }
    
    setLoading(true)
    
    try {
      console.log('Tentando login:', email)
      
      // Chamada REAL à API
      const response = await api.post('/auth/login', { email, password: senha })
      
      console.log('Resposta:', response.data)
      
      const { token, user } = response.data
      
      // Salvar token e usuário
      localStorage.setItem('aurora_token', token)
      localStorage.setItem('aurora_user', JSON.stringify(user))
      
      // Redirecionar baseado na role
      switch (user.role) {
        case 'admin':
        case 'secretary':
          navigate('/admin/dashboard')
          break
        case 'teacher':
          navigate('/teacher/dashboard')
          break
        default:
          navigate('/student/dashboard')
      }
      
    } catch (error) {
      console.error('Erro no login:', error)
      const mensagem = error.response?.data?.error || 'Erro ao fazer login'
      setErro(mensagem)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sistema Escolar Aurora</h1>
          <p>Conectado ao banco de dados</p>
        </div>

        {erro && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="admin@escola.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
            />
            <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ fontSize: '12px', marginTop: '5px' }}>
              {mostrarSenha ? '🙈 Ocultar' : '👁️ Mostrar'}
            </button>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? '⏳ Conectando...' : '🔐 Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '13px' }}>
          <p><strong>Contas de teste:</strong></p>
          <p>📧 admin@escola.com / 123456</p>
          <p>📧 prof@escola.com / 123456</p>
          <p>📧 aluno@escola.com / 123456</p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen