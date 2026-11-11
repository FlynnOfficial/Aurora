import { lazy, Suspense, useEffect, useState } from 'react';
import { Login } from './components/Login';
import { AuthenticatedUser, UserRole } from '../types';
import { ApiError, api } from '../services/api';

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
  const [initializing, setInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState('');
  const [sessionAttempt, setSessionAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const endSession = () => {
      setUser(null);
      setUserType(null);
      setScreen('login');
    };

    localStorage.removeItem('user');
    window.addEventListener('aurora:session-expired', endSession);
    api.getCurrentUser().then((response) => {
      if (!active) return;
      setUser({ id: response.userId, name: response.name, email: response.email, role: response.role });
      setUserType(response.role.toLowerCase() as UserRole);
    }).catch((error: unknown) => {
      if (active && !(error instanceof ApiError && error.status === 401)) {
        setInitializationError(error instanceof Error ? error.message : 'Não foi possível verificar sua sessão');
      }
    }).finally(() => { if (active) setInitializing(false); });

    return () => {
      active = false;
      window.removeEventListener('aurora:session-expired', endSession);
    };
  }, [sessionAttempt]);

  const handleLogin = (userData: AuthenticatedUser, type: UserRole) => {
    setUser(userData);
    setUserType(type);
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setScreen('login');
    api.logout().catch(() => undefined);
  };

  if (initializing) return <LoadingScreen />;
  if (initializationError) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-slate-50 p-6">
      <p role="alert" className="text-center text-sm text-slate-600">{initializationError}</p>
      <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
        onClick={() => {
          setInitializationError('');
          setInitializing(true);
          setSessionAttempt((attempt) => attempt + 1);
        }}>Tentar novamente</button>
    </div>
  );

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
      {userType !== 'super_admin' && userType && <SupportChat key={user.id} user={user} userType={userType} />}
      </>
    </Suspense>
  );
}
