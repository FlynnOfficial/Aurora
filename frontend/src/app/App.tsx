import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { Chatbot } from './components/Chatbot';

interface User {
  name: string;
  email: string;
  [key: string]: any;
}

type UserType = 'student' | 'teacher' | 'admin' | 'super_admin' | null;
type Screen = 'login' | 'register';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    // Checa se o usuário já está logado
    const token = localStorage.getItem('token');
    if (token) {
      // Restaura a sessão do usuário se necessário
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser.user);
        setUserType(parsedUser.userType);
      }
    }
  }, []);

  const handleLogin = (userData: User, type: 'student' | 'teacher' | 'admin' | 'super_admin') => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('user', JSON.stringify({ user: userData, userType: type }));
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setScreen('login');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  };

  if (screen === 'register') {
    return <Register onBack={() => setScreen('login')} />;
  }

  if (!user || !userType) {
    return <Login onLogin={handleLogin} onRegister={() => setScreen('register')} />;
  }

  return (
    <>
      {userType === 'student' && <StudentDashboard user={user} onLogout={handleLogout} />}
      {userType === 'teacher' && <TeacherDashboard user={user} onLogout={handleLogout} />}
      {userType === 'admin' && <AdminDashboard user={user} onLogout={handleLogout} />}
      {userType === 'super_admin' && <SuperAdminDashboard user={user} onLogout={handleLogout} />}
      {userType !== 'super_admin' && <Chatbot />}
    </>
  );
}
