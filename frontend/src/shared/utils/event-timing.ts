export type TemporalEventStatus = 'upcoming' | 'ongoing' | 'ended';

export const getTemporalEventStatus = (startAt: string, endAt: string): TemporalEventStatus => {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (now < start) {
    return 'upcoming';
  }

  if (now > end) {
    return 'ended';
  }

  return 'ongoing';
};

export const getCountdownParts = (startAt: string) => {
  const difference = new Date(startAt).getTime() - Date.now();
  const safeDifference = Math.max(difference, 0);

  const days = Math.floor(safeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDifference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDifference / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDifference / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isComplete: difference <= 0,
  };
};
