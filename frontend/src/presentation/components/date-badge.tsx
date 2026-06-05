import { formatCalendarDay } from '../../shared/utils/date-format';

interface DateBadgeProps {
  value: string;
}

export const DateBadge = ({ value }: DateBadgeProps) => {
  const { month, day } = formatCalendarDay(value);

  return (
    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-[1.5rem] bg-white text-ink shadow-lg shadow-brand-950/10">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">{month}</span>
      <span className="mt-1 text-3xl font-bold">{day}</span>
    </div>
  );
};
