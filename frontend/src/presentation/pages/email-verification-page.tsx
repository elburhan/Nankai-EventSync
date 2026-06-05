import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ZodError } from 'zod';

import { verifyEmailSchema } from '../../business/schemas/auth.schema';
import { useAuth } from '../../shared/hooks/use-auth';
import { APP_ROUTES } from '../../shared/constants/app-route';
import { useNotification } from '../../shared/hooks/use-notification';

interface VerificationLocationState {
  email?: string;
}

export const EmailVerificationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification } = useAuth();
  const { notify } = useNotification();
  const locationState = (location.state ?? null) as VerificationLocationState | null;
  const [email, setEmail] = useState(locationState?.email ?? '');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCountdown((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCountdown]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = verifyEmailSchema.parse({
        email,
        code,
      });

      await verifyEmail(payload);
      notify({
        tone: 'success',
        title: t('toasts.emailVerifiedTitle'),
        description: t('toasts.emailVerifiedDescription'),
      });
      navigate(APP_ROUTES.LOGIN, {
        replace: true,
        state: { email: payload.email },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        setErrorMessage(error.issues[0]?.message ?? t('auth.verificationError'));
      } else {
        setErrorMessage(error instanceof Error ? error.message : t('auth.verificationError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || isResending || resendCountdown > 0) {
      return;
    }

    setErrorMessage(null);
    setIsResending(true);

    try {
      const response = await resendVerification(email);
      setResendCountdown(60);
      notify({
        tone: 'success',
        title: t('toasts.verificationResentTitle'),
        description: t('toasts.verificationResentDescription', { email: response.email }),
      });
    } catch (error) {
      notify({
        tone: 'error',
        title: t('toasts.verificationResentErrorTitle'),
        description: error instanceof Error ? error.message : t('auth.resendCodeError'),
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="animate-fade-in grid min-h-[calc(100vh-5rem)] gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section
        className="relative overflow-hidden rounded-5xl px-8 py-12 text-white shadow-lifted sm:px-12"
        style={{ background: 'linear-gradient(135deg, #0c1e3c 0%, #1a3a6b 45%, #c9a227 130%)' }}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-400/10" />
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-30" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
              {t('auth.verifyEyebrow')}
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-extrabold leading-tight sm:text-[2.75rem]">
              {t('auth.verifyTitle')}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-200">
              {t('auth.verifyDescription')}
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              {t('auth.verificationInstructionsTitle')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              {t('auth.verificationInstructions')}
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center py-8">
        <div className="w-full rounded-5xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-600">
            {t('common.eventsync')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">{t('auth.verifyFormTitle')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{t('auth.verifyFormSubtitle')}</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t('auth.email')}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
                placeholder="student@nankai.edu.cn"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t('auth.verificationCode')}</span>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.trim().replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.4em] text-ink outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
                placeholder={t('auth.verificationCodePlaceholder')}
                required
              />
            </label>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">{t('auth.didNotReceiveCode')}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {resendCountdown > 0
                    ? t('auth.resendCodeCountdown', { seconds: resendCountdown })
                    : t('auth.resendCodeHint')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || resendCountdown > 0 || email.trim().length === 0}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-gold-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResending ? t('auth.resendingCode') : t('auth.resendCode')}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t('auth.verifyingButton') : t('auth.verifySubmit')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {t('auth.alreadyRegistered')}{' '}
            <Link to={APP_ROUTES.LOGIN} className="font-semibold text-brand-700 hover:underline">
              {t('auth.loginInstead')}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};
