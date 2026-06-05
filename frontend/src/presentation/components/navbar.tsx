import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import { className } from '../../shared/utils/class-name';
import { LanguageSwitcher } from './language-switcher';

export const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={APP_ROUTES.HOME}
          className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink shadow-sm ring-1 ring-ink/10">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
              <img
                src="/images/nankai-logo.png"
                alt="Nankai University logo"
                className="h-7 w-7 object-contain"
              />
            </span>
          </span>
          <div className="hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-widest text-ink">
              {t('common.eventsync')}
            </p>
            <p className="text-xs text-slate-400">{t('nav.tagline')}</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              <NavLink
                to={APP_ROUTES.HOME}
                className={({ isActive }) =>
                  className(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                    isActive
                      ? 'bg-ink text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
                  )
                }
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                to={APP_ROUTES.DASHBOARD}
                className={({ isActive }) =>
                  className(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                    isActive
                      ? 'bg-ink text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
                  )
                }
              >
                {t('nav.dashboard')}
              </NavLink>
              <NavLink
                to={APP_ROUTES.EVENTS}
                className={({ isActive }) =>
                  className(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                    isActive
                      ? 'bg-ink text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
                  )
                }
              >
                {t('nav.events')}
              </NavLink>
              {user?.role === 'organizer' ? (
                <NavLink
                  to={APP_ROUTES.CREATE_EVENT}
                  className={({ isActive }) =>
                    className(
                      'rounded-full px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                      isActive
                        ? 'bg-gold-500 text-white shadow-sm'
                        : 'bg-gold-500 text-white shadow-sm hover:bg-gold-600',
                    )
                  }
                >
                  {t('nav.createEvent')}
                </NavLink>
              ) : null}

              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 md:block">
                {user?.fullName ?? t('common.guest')}
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to={APP_ROUTES.HOME}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {t('nav.home')}
              </Link>
              <Link
                to={APP_ROUTES.LOGIN}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {t('nav.login')}
              </Link>
              <Link
                to={APP_ROUTES.REGISTER}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
