import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZodError } from 'zod';

import { loginSchema, registerSchema } from '../../business/schemas/auth.schema';
import type { LoginFormValues, RegisterFormValues } from '../../shared/types/auth';

interface LoginAuthFormProps {
  mode: 'login';
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (values: LoginFormValues) => Promise<void>;
}

interface RegisterAuthFormProps {
  mode: 'register';
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
}

type AuthFormProps = LoginAuthFormProps | RegisterAuthFormProps;

export const AuthForm = ({ mode, title, subtitle, submitLabel, onSubmit }: AuthFormProps) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleRoleChange = (value: RegisterFormValues['role']) => {
    setValues((currentValues) => ({
      ...currentValues,
      role: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const parsedValues = loginSchema.parse({
          email: values.email,
          password: values.password,
        });
        await onSubmit(parsedValues);
      } else {
        const parsedValues = registerSchema.parse(values);
        await onSubmit(parsedValues);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        setErrorMessage(error.issues[0]?.message ?? t('auth.continueError'));
      } else {
        setErrorMessage(error instanceof Error ? error.message : t('auth.continueError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-5xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur sm:p-10">
      <p className="text-xs font-bold uppercase tracking-widest text-gold-600">
        {t('common.eventsync')}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {mode === 'register' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('auth.fullName')}</span>
            <input
              value={values.fullName}
              onChange={(event) => handleChange('fullName', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
              placeholder="Liu Wen"
              required
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">{t('auth.email')}</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => handleChange('email', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
            placeholder="student@nankai.edu.cn"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">{t('auth.password')}</span>
          <input
            type="password"
            value={values.password}
            onChange={(event) => handleChange('password', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
            placeholder="Minimum 8 characters"
            required
          />
        </label>

        {mode === 'register' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('auth.confirmPassword')}</span>
            <input
              type="password"
              value={values.confirmPassword}
              onChange={(event) => handleChange('confirmPassword', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
              placeholder="Repeat your password"
              required
            />
          </label>
        ) : null}

        {mode === 'register' ? (
          <fieldset>
            <legend className="mb-3 block text-sm font-semibold text-slate-700">{t('auth.accountType')}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: t('auth.student'), value: 'student' as const, description: t('auth.studentDescription'), emoji: '🎓' },
                { label: t('auth.organizer'), value: 'organizer' as const, description: t('auth.organizerDescription'), emoji: '📋' },
              ].map((option) => {
                const isActive = values.role === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoleChange(option.value)}
                    className={`rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                      isActive
                        ? 'border-gold-400 bg-gold-50 text-ink ring-2 ring-gold-400/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg" aria-hidden="true">{option.emoji}</span>
                    <p className="mt-1.5 font-semibold">{option.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t('common.loading') : submitLabel}
        </button>
      </form>
    </div>
  );
};
