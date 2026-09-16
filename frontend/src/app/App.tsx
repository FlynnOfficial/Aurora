import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { SupportChat } from './components/SupportChat';
import { AuthenticatedUser, UserRole } from '../types';
import { api } from '../services/api';

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
    api.getCurrentUser().then((response) => {
      const user: AuthenticatedUser = { id: response.userId, name: response.name, email: response.email, role: response.role };
      setUser(user);
      setUserType(response.role.toLowerCase() as UserRole);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const blockInspectionShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blocked = event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (event.metaKey && event.altKey && ['i', 'j', 'c'].includes(key));

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const blockContextMenu = (event: MouseEvent) => event.preventDefault();

    document.addEventListener('keydown', blockInspectionShortcuts, true);
    document.addEventListener('contextmenu', blockContextMenu);

    return () => {
      document.removeEventListener('keydown', blockInspectionShortcuts, true);
      document.removeEventListener('contextmenu', blockContextMenu);
    };
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
    api.logout().catch(() => undefined);
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
