import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthForm } from '../components/auth-form';
import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import type {
  RegisterFormValues,
  RegistrationVerificationPayload,
} from '../../shared/types/auth';
import { useNotification } from '../../shared/hooks/use-notification';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { notify } = useNotification();

  const handleRegister = async (values: RegisterFormValues) => {
    const verificationPayload: RegistrationVerificationPayload = await register(values);
    notify({
      tone: 'success',
      title: t('toasts.registrationPendingTitle'),
      description: t('toasts.registrationPendingDescription', {
        email: verificationPayload.email,
      }),
    });
    navigate(APP_ROUTES.VERIFY_EMAIL, {
      replace: true,
      state: {
        email: verificationPayload.email,
      },
    });
  };

  return (
    <div className="animate-fade-in grid min-h-[calc(100vh-5rem)] gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section
        className="relative overflow-hidden rounded-5xl px-8 py-12 text-white shadow-lifted sm:px-12"
        style={{
          background:
            'linear-gradient(135deg, #0c1e3c 0%, #1a3a6b 45%, #c9a227 130%)',
        }}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-400/10" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-56 w-56 rounded-full bg-brand-500/10" />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-30" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
              {t('auth.registerHero')}
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-extrabold leading-tight sm:text-[2.75rem]">
              {t('auth.joinHeroTitle')}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-200">
              {t('auth.joinHeroDescription')}
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-gold-200"
                aria-hidden="true"
              >
                <path d="M2 8l10-5 10 5-10 5-10-5z" />
                <path d="M6 10.5V15c0 1.1 2.7 3 6 3s6-1.9 6-3v-4.5" />
              </svg>
              <p className="mt-2 text-sm font-semibold text-white">
                {t('auth.student')}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {t('auth.studentDescription')}
              </p>
            </div>
            <div className="rounded-2xl border border-gold-400/25 bg-gold-400/10 p-4 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-gold-200"
                aria-hidden="true"
              >
                <rect x="5" y="4" width="14" height="16" rx="2" />
                <path d="M9 8h6M9 12h6M9 16h4" />
              </svg>
              <p className="mt-2 text-sm font-semibold text-white">
                {t('auth.organizer')}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {t('auth.organizerDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center py-8">
        <div className="w-full">
          <AuthForm
            mode="register"
            title={t('auth.registerTitle')}
            subtitle={t('auth.registerSubtitle')}
            submitLabel={t('auth.registerSubmit')}
            onSubmit={handleRegister}
          />
          <p className="mt-5 text-center text-sm text-slate-500">
            {t('auth.alreadyRegistered')}{' '}
            <Link
              to={APP_ROUTES.LOGIN}
              className="font-semibold text-brand-700 hover:underline"
            >
              {t('auth.loginInstead')}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};
