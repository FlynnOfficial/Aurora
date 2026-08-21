import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CheckCircle, Eye, EyeOff, KeyRound, X } from 'lucide-react';

type Step = 'fields' | 'code' | 'done';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [step, setStep] = useState<Step>('fields');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateFields = () => {
    const errs: Record<string, string> = {};
    if (!current.trim()) errs.current = 'Obrigatório';
    if (next.length < 8) errs.next = 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(next)) errs.next = 'Inclua letra maiúscula';
    if (!/\d/.test(next)) errs.next = 'Inclua um número';
    if (next !== confirm) errs.confirm = 'As senhas não coincidem';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold flex items-center gap-2">
            <KeyRound className="size-4 text-purple-600" />
            Trocar Senha
          </p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {step === 'fields' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Senha atual</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={current}
                onChange={(e) => { setCurrent(e.target.value); setErrors((p) => ({ ...p, current: '' })); }}
                className={errors.current ? 'border-red-400' : ''}
              />
              {errors.current && <p className="text-xs text-red-500">{errors.current}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nova senha</Label>
              <div className="relative">
                <Input
                  type={showNext ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={next}
                  onChange={(e) => { setNext(e.target.value); setErrors((p) => ({ ...p, next: '' })); }}
                  className={`pr-9 ${errors.next ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNext((p) => !p)}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.next && <p className="text-xs text-red-500">{errors.next}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Confirmar nova senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
                className={errors.confirm ? 'border-red-400' : ''}
              />
              {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => { if (validateFields()) setStep('code'); }}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Um código de 6 dígitos foi enviado ao seu e-mail cadastrado. Digite abaixo para confirmar.
            </p>
            <div className="space-y-1">
              <Label className="text-xs">Código de verificação</Label>
              <Input
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="tracking-widest text-center text-lg"
              />
            </div>
            <p className="text-xs text-gray-400">Demo: qualquer sequência de 6 dígitos.</p>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={code.length !== 6 || submitting}
              onClick={async () => {
                setSubmitting(true);
                try {
                  const { api } = await import('../../services/api');
                  const userId = Number(localStorage.getItem('userId'));
                  await api.changePassword(userId, current, next);
                  setStep('done');
                } catch (error) {
                  setErrors({ code: error instanceof Error ? error.message : 'Não foi possível alterar a senha' });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Confirmar
            </Button>
            {errors.code && <p className="text-xs text-red-500 text-center">{errors.code}</p>}
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-3 py-2">
            <CheckCircle className="size-10 text-green-500 mx-auto" />
            <p className="font-medium text-green-700">Senha alterada com sucesso!</p>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
