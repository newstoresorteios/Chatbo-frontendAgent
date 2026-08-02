import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    company: z.string().optional(),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const user = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        company: data.company,
      });
      addToast({
        title: 'Conta criada',
        message: 'Bem-vindo ao ChatBô!',
        type: 'success',
      });
      navigate(user.onboardingStatus === 'complete' ? '/dashboard' : '/onboarding');
    } catch (error) {
      addToast({
        title: 'Não foi possível cadastrar',
        message: error instanceof Error ? error.message : 'Verifique os dados e tente novamente',
        type: 'error',
      });
    }
  };

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
      </div>

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
            <Link to="/" className="inline-block">
              <Logo size="md" full className="mx-auto max-w-[220px]" />
            </Link>
            <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
              Crie sua conta empresarial
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Configure o ambiente da sua empresa para gerenciar o Assistente ChatBô.
            </p>
            <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-gray-500">
              Esta conta é destinada a empresas e equipes que administram o ChatBô. Clientes finais
              são atendidos pelos canais comerciais da empresa.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              autoComplete="name"
              placeholder="Seu nome"
              error={errors.name?.message}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              {...register('name')}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@empresa.com"
              error={errors.email?.message}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              {...register('email')}
            />
            <Input
              label="Empresa (opcional)"
              autoComplete="organization"
              placeholder="Nome da empresa"
              error={errors.company?.message}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
              {...register('company')}
            />
            <Input
              label="Senha"
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

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              <UserPlus className="h-4 w-4" />
              Criar conta
            </Button>
          </form>

          <div className="mt-6 border-t border-white/5 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Já tem conta?{' '}
              <Link to="/login" className="font-medium text-blue-400 hover:underline">
                Entrar na plataforma
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-600">
          <Building2 className="h-3.5 w-3.5" />
          Seus dados ficam protegidos no Supabase - LGPD
        </p>
      </motion.div>
    </div>
  );
}
