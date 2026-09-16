import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { SupportChat } from './components/SupportChat';
import { AuthenticatedUser, UserRole } from '../types';

type UserType = UserRole | null;
type Screen = 'login' | 'register';

interface StoredSession {
  user: AuthenticatedUser;
  userType: UserRole;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return;

    try {
      const session = JSON.parse(storedUser) as StoredSession;
      if (session.user && session.userType) {
        setUser(session.user);
        setUserType(session.userType);
      }
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogin = (userData: AuthenticatedUser, type: UserRole) => {
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
      {userType !== 'super_admin' && userType && <SupportChat user={user} userType={userType} />}
    </>
  );
}
