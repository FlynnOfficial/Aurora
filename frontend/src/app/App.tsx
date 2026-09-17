import { lazy, Suspense, useEffect, useState } from 'react';
import { Login } from './components/Login';
import { AuthenticatedUser, UserRole } from '../types';
import { api } from '../services/api';

const Register = lazy(() => import('./components/Register').then(({ Register }) => ({ default: Register })));
const StudentDashboard = lazy(() => import('./components/StudentDashboard').then(({ StudentDashboard }) => ({ default: StudentDashboard })));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard').then(({ TeacherDashboard }) => ({ default: TeacherDashboard })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(({ AdminDashboard }) => ({ default: AdminDashboard })));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard').then(({ SuperAdminDashboard }) => ({ default: SuperAdminDashboard })));
const SupportChat = lazy(() => import('./components/SupportChat').then(({ SupportChat }) => ({ default: SupportChat })));

type UserType = UserRole | null;
type Screen = 'login' | 'register';

function LoadingScreen() {
  return <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 text-sm text-slate-500">Carregando...</div>;
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
    return <Suspense fallback={<LoadingScreen />}><Register onBack={() => setScreen('login')} /></Suspense>;
  }

  if (!user || !userType) {
    return <Login onLogin={handleLogin} onRegister={() => setScreen('register')} />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <>
      {userType === 'student' && <StudentDashboard user={user} onLogout={handleLogout} />}
      {userType === 'teacher' && <TeacherDashboard user={user} onLogout={handleLogout} />}
      {userType === 'admin' && <AdminDashboard user={user} onLogout={handleLogout} />}
      {userType === 'super_admin' && <SuperAdminDashboard user={user} onLogout={handleLogout} />}
      {userType !== 'super_admin' && userType && <SupportChat user={user} userType={userType} />}
      </>
    </Suspense>
  );
}
