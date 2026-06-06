import { useTranslation } from 'react-i18next';

import {
  getEventCategoryTranslationKey,
  normalizeEventCategory,
} from '../../shared/constants/event-category';
import type { EventItem } from '../../shared/types/event';
import { className } from '../../shared/utils/class-name';
import { formatCalendarDay } from '../../shared/utils/date-format';

interface CalendarViewProps {
  events: EventItem[];
  baseDate?: Date;
}

const buildCalendarDays = (events: EventItem[], baseDateOverride?: Date) => {
  const today = new Date();
  const baseDate =
    baseDateOverride ?? (events.length > 0 ? new Date(events[0].startAt) : today);
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const totalSlots = Math.ceil((startOffset + monthEnd.getDate()) / 7) * 7;

  const eventsByDate = events.reduce<Record<string, EventItem[]>>((accumulator, event) => {
    const key = new Date(event.startAt).toISOString().slice(0, 10);
    accumulator[key] = [...(accumulator[key] ?? []), event];
    return accumulator;
  }, {});

  return Array.from({ length: totalSlots }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    const isInMonth = dayNumber >= 1 && dayNumber <= monthEnd.getDate();
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayNumber);
    const key = isInMonth ? date.toISOString().slice(0, 10) : '';

    return {
      key: isInMonth ? key : `empty-${index}`,
      label: isInMonth ? String(dayNumber) : '',
      isInMonth,
      events: isInMonth ? eventsByDate[key] ?? [] : [],
    };
  });
};

export const CalendarView = ({ events, baseDate }: CalendarViewProps) => {
  const { t } = useTranslation();
  const days = buildCalendarDays(events, baseDate);
  const resolvedBaseDate =
    baseDate ?? (events.length > 0 ? new Date(events[0].startAt) : new Date());
  const weekdayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur sm:p-8">
      <div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            {t('calendar.viewTitle')}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            {resolvedBaseDate.toLocaleString([], { month: 'long', year: 'numeric' })}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {weekdayKeys.map((day) => (
          <div key={day}>{t(`calendar.weekdays.${day}`)}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.key}
            className={className(
              'min-h-[7rem] rounded-[1.25rem] border p-2 sm:p-3',
              day.isInMonth
                ? 'border-slate-200 bg-slate-50'
                : 'border-transparent bg-transparent',
            )}
          >
            {day.isInMonth ? (
              <>
                <p className="text-sm font-semibold text-ink">{day.label}</p>
                <div className="mt-2 space-y-2">
                  {day.events.slice(0, 2).map((event) => {
                    const calendarDay = formatCalendarDay(event.startAt);

                    return (
                      <div
                        key={event.id}
                        className="rounded-xl bg-white px-2 py-2 text-left shadow-sm"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                          {t(
                            getEventCategoryTranslationKey(
                              normalizeEventCategory(event.category),
                            ),
                          )}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs font-medium text-ink">
                          {event.title}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {calendarDay.month} {calendarDay.day}
                        </p>
                      </div>
                    );
                  })}
                  {day.events.length > 2 ? (
                    <p className="text-[11px] font-medium text-slate-500">
                      {t('calendar.moreEvents', { count: day.events.length - 2 })}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};
