import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, User, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { mockSuperAdmins } from '../data/mockData';

interface LoginProps {
  onLogin: (user: any, userType: 'student' | 'teacher' | 'admin' | 'super_admin') => void;
  onRegister: () => void;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher' | 'admin'>('student');
  const [adminError, setAdminError] = useState('');

  const resetFields = () => { setEmail(''); setPassword(''); setAdminError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { api } = await import('../services/api');
      const response = await api.login(email, password);

      if (response.error) {
        setAdminError(response.error);
        return;
      }

      // Store token
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId);

      onLogin({
        name: response.name,
        email: response.email,
      }, response.role.toLowerCase() as 'student' | 'teacher' | 'admin' | 'super_admin');
    } catch (error) {
      setAdminError('Erro ao conectar ao servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <GraduationCap className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Sistema Escolar</CardTitle>
          <CardDescription>Acesse seu painel com suas credenciais</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            value={userType}
            onValueChange={(v) => {
              setUserType(v as typeof userType);
              resetFields();
            }}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="size-4" />
                Aluno
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <GraduationCap className="size-4" />
                Professor
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* ── Aluno ── */}
            <TabsContent value="student">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="seu.email@escola.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Entrar como Aluno
                </Button>
                <p className="text-sm text-center text-gray-500">
                  Demo: maria.silva@escola.com / aluno123
                </p>
              </form>
            </TabsContent>

            {/* ── Professor ── */}
            <TabsContent value="teacher">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="professor@escola.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      id="teacher-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Entrar como Professor
                </Button>
                <p className="text-sm text-center text-gray-500">
                  Demo: carlos.oliveira@escola.com / prof123
                </p>
              </form>
            </TabsContent>

            {/* ── Admin ── */}
            <TabsContent value="admin">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@escola.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setAdminError(''); }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setAdminError(''); }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {adminError && (
                  <p className="text-xs text-red-500 text-center">{adminError}</p>
                )}

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  Entrar como Administrador
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onRegister}
                  className="w-full flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <UserPlus className="size-4" />
                  Cadastrar nova conta
                </Button>

                <div className="text-xs text-center text-gray-400 space-y-0.5">
                  <p>Demo Admin: helena.costa@escola.com / admin123</p>
                  <p>Demo Super Admin: superadmin@escola.com / Super@Admin1</p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
