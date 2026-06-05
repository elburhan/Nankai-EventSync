import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { className } from '../../shared/utils/class-name';
import { getCountdownParts, getTemporalEventStatus } from '../../shared/utils/event-timing';

interface EventTemporalStatusProps {
  startAt: string;
  endAt: string;
}

export const EventTemporalStatus = ({ startAt, endAt }: EventTemporalStatusProps) => {
  const { t } = useTranslation();
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  void tick;

  const temporalStatus = getTemporalEventStatus(startAt, endAt);
  const countdown = getCountdownParts(startAt);

  const badgeStyles =
    temporalStatus === 'upcoming'
      ? 'border border-gold-200 bg-gold-50 text-gold-700'
      : temporalStatus === 'ongoing'
        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border border-slate-200 bg-slate-100 text-slate-600';

  return (
    <div className="space-y-1.5">
      <span
        className={className(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest',
          badgeStyles,
        )}
      >
        {temporalStatus === 'ongoing' ? (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" aria-hidden="true" />
        ) : null}
        {t(`temporal.${temporalStatus}`)}
      </span>
      {temporalStatus === 'upcoming' ? (
        <p className="text-xs font-medium tabular-nums text-slate-500">
          {t('temporal.countdownPrefix')}{' '}
          <span className="font-semibold text-ink">
            {countdown.days}{t('temporal.days')}{' '}
            {countdown.hours}{t('temporal.hours')}{' '}
            {countdown.minutes}{t('temporal.minutes')}{' '}
            {countdown.seconds}{t('temporal.seconds')}
          </span>
        </p>
      ) : null}
    </div>
  );
};
