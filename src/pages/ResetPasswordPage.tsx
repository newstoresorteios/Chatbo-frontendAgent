import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/contexts/NotificationContext';
import { authService } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      addToast({
        title: 'Link inválido',
        message: 'Solicite uma nova recuperação de senha',
        type: 'error',
      });
      return;
    }

    try {
      const { data: res } = await authService.resetPassword(token, data.password);
      addToast({ title: 'Senha redefinida', message: res.message, type: 'success' });
      navigate('/login');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (error instanceof Error ? error.message : 'Link expirado ou inválido');
      addToast({
        title: 'Não foi possível redefinir',
        message: typeof message === 'string' ? message : 'Link expirado ou inválido',
        type: 'error',
      });
    }
  };

  if (!token) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Link inválido</h1>
          <p className="mt-2 text-sm text-gray-400">Solicite um novo link na tela de login.</p>
          <Link to="/login" className="mt-6 inline-block text-blue-400 hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4">
      <Link
        to="/login"
        className="absolute left-4 top-4 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <Logo size="md" full className="mx-auto max-w-[220px]" />
            <h1 className="mt-6 text-2xl font-bold text-white">Nova senha</h1>
            <p className="mt-2 text-sm text-gray-400">Digite e confirme sua nova senha</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              error={errors.password?.message}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              {...register('password')}
            />
            <Input
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              error={errors.confirmPassword?.message}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              {...register('confirmPassword')}
            />
            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              <KeyRound className="h-4 w-4" />
              Redefinir senha
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
