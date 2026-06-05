import { i18n } from '../../integration/i18n/i18n';

export const formatEventDate = (value: string): string => {
  const date = new Date(value);

  return date.toLocaleString(i18n.language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCalendarDay = (value: string): { month: string; day: string } => {
  const date = new Date(value);

  return {
    month: date.toLocaleString(i18n.language, { month: 'short' }),
    day: date.toLocaleString(i18n.language, { day: '2-digit' }),
  };
};
