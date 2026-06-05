import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthForm } from '../components/auth-form';
import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import type { LoginFormValues } from '../../shared/types/auth';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? APP_ROUTES.DASHBOARD;

  const handleLogin = async (values: LoginFormValues) => {
    await login(values);
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="animate-fade-in grid min-h-[calc(100vh-5rem)] gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative overflow-hidden rounded-5xl bg-navy-gradient px-8 py-12 text-white shadow-lifted sm:px-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-gold-500/8" />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-40" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
              {t('auth.welcomeBack')}
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-extrabold leading-tight sm:text-[2.75rem]">
              {t('auth.signInHeroTitle')}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-300">
              {t('auth.signInHeroDescription')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3">
            {[
              { icon: 'lightning', label: 'Real-time updates' },
              { icon: 'globe', label: 'Bilingual EN / 中文' },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/8 px-3 py-2.5 backdrop-blur-sm"
              >
                {badge.icon === 'lightning' ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-gold-200"
                    aria-hidden="true"
                  >
                    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-gold-200"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                  </svg>
                )}
                <span className="text-xs font-medium text-slate-300">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center py-8">
        <div className="w-full">
          <AuthForm
            mode="login"
            title={t('auth.loginTitle')}
            subtitle={t('auth.loginSubtitle')}
            submitLabel={t('auth.loginSubmit')}
            onSubmit={handleLogin}
          />
          <p className="mt-5 text-center text-sm text-slate-500">
            {t('auth.needAccount')}{' '}
            <Link
              to={APP_ROUTES.REGISTER}
              className="font-semibold text-brand-700 hover:underline"
            >
              {t('auth.createOneHere')}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};
