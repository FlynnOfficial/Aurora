import { useState } from 'react'
import LoginScreen from './LoginScreen'
import StudentDashboard from './components/StudentDashboard'
import TeacherDashboard from './TeacherDashboard'
import AdminDashboard from './AdminDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)

  const handleLogin = (email, password, type) => {
    let userName = email.split('@')[0]
    
    userName = userName.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')
    
    if (type === 'administrador') {
      userName = userName === 'Daniel Ferro' ? 'Daniel Ferro' : userName
    }
    
    setUser({ email, name: userName })
    setUserType(type)
    console.log('Login realizado:', { email, type })
  }

  const handleLogout = () => {
    setUser(null)
    setUserType(null)
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (userType === 'aluno') {
    return <StudentDashboard user={user} onLogout={handleLogout} />
  }

  if (userType === 'professor') {
    return <TeacherDashboard user={user} onLogout={handleLogout} />
  }

  if (userType === 'administrador') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }

  return <LoginScreen onLogin={handleLogin} />
}

export default App