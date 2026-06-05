import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getEventDetailRoute } from '../../shared/constants/app-route';
import { getEventCategoryTranslationKey, normalizeEventCategory } from '../../shared/constants/event-category';
import type { RecommendedEventItem } from '../../shared/types/event';
import { formatEventDate } from '../../shared/utils/date-format';

interface RecommendedEventListProps {
  items: RecommendedEventItem[];
}

export const RecommendedEventList = ({ items }: RecommendedEventListProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.event.id}
          className="rounded-4xl border border-white/60 bg-white/90 p-5 shadow-card backdrop-blur"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-700">
              {t(getEventCategoryTranslationKey(normalizeEventCategory(item.event.category)))}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
              {t(`eventForm.labels.${item.event.status}`)}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-bold text-ink">{item.event.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.reason}</p>

          <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {t('recommendations.starts')}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">{formatEventDate(item.event.startAt)}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.event.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-700">
                #{tag}
              </span>
            ))}
          </div>

          <Link
            to={getEventDetailRoute(item.event.id)}
            className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            {t('recommendations.open')}
          </Link>
        </article>
      ))}
    </div>
  );
};
