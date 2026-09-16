import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Lock, Mail, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any, userType: 'student' | 'teacher' | 'admin' | 'super_admin') => void;
  onRegister: () => void;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { api } = await import('../../services/api');
      const response = await api.login(email, password);

      // Store token
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('userId', String(response.userId));

      onLogin({
        id: response.userId,
        name: response.name,
        email: response.email,
        role: response.role,
      }, response.role.toLowerCase() as 'student' | 'teacher' | 'admin' | 'super_admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor');
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
          <CardTitle className="text-2xl">Aurora</CardTitle>
          <CardDescription>Acesse seu painel com suas credenciais</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@escola.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Entrar
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
              className="w-full flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <UserPlus className="size-4" />
              Cadastrar nova conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
