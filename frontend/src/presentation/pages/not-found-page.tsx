import { Link } from 'react-router-dom';

import { APP_ROUTES } from '../../shared/constants/app-route';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="max-w-xl rounded-[2rem] border border-white/60 bg-white/85 p-10 text-center shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">404</p>
        <h1 className="mt-4 text-4xl font-bold text-ink">This page wandered off campus.</h1>
        <p className="mt-4 text-sm text-slate-600">
          The route you requested does not exist yet. Head back to the dashboard and continue building the EventSync experience.
        </p>
        <Link
          to={APP_ROUTES.DASHBOARD}
          className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
};
