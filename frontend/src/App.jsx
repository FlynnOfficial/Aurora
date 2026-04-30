import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import StudentDashboard from './components/StudentDashboard'
import TeacherDashboard from './components/TeacherDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)

  const handleLogin = (email, password, type) => {
    const userName = email.split('@')[0]
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

  return <LoginScreen onLogin={handleLogin} />
}

export default App