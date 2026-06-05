import { useCallback, useMemo, useState } from 'react';

import type { CalendarEventQueryParams, EventItem, EventQueryParams } from '../types/event';

interface EventDateRange {
  fromDate: string;
  toDate: string;
}

export interface EventFilters {
  dateFrom: string;
  dateTo: string;
  status: 'all' | EventItem['status'];
  organizerId: string;
  searchText: string;
}

interface BuildEventQueryInput {
  page?: number;
  limit?: number;
}

const buildMonthRange = (baseDate: Date): EventDateRange => {
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    fromDate: monthStart.toISOString().slice(0, 10),
    toDate: monthEnd.toISOString().slice(0, 10),
  };
};

const toCalendarBoundary = (value: string, boundary: 'start' | 'end'): string => {
  const timeSuffix = boundary === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
  return new Date(`${value}${timeSuffix}`).toISOString();
};

export const useEventDateRangeQuery = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [filters, setFilters] = useState<EventFilters>(() => {
    const monthRange = buildMonthRange(new Date());

    return {
      dateFrom: monthRange.fromDate,
      dateTo: monthRange.toDate,
      status: 'all',
      organizerId: '',
      searchText: '',
    };
  });

  const updateMonthRange = useCallback((nextMonthDate: Date): void => {
    setCurrentMonth(nextMonthDate);
    const monthRange = buildMonthRange(nextMonthDate);
    setFilters((currentFilters) => ({
      ...currentFilters,
      dateFrom: monthRange.fromDate,
      dateTo: monthRange.toDate,
    }));
  }, []);

  const goToPreviousMonth = useCallback((): void => {
    updateMonthRange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }, [currentMonth, updateMonthRange]);

  const goToNextMonth = useCallback((): void => {
    updateMonthRange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }, [currentMonth, updateMonthRange]);

  const setFromDate = useCallback((fromDate: string): void => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      dateFrom: fromDate,
    }));
  }, []);

  const setToDate = useCallback((toDate: string): void => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      dateTo: toDate,
    }));
  }, []);

  const setStatusFilter = useCallback((status: EventFilters['status']): void => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      status,
    }));
  }, []);

  const setOrganizerFilter = useCallback((organizerId: string): void => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      organizerId,
    }));
  }, []);

  const setSearchText = useCallback((searchText: string): void => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      searchText,
    }));
  }, []);

  const visibleRange = useMemo<EventDateRange>(() => ({
    fromDate: filters.dateFrom,
    toDate: filters.dateTo,
  }), [filters.dateFrom, filters.dateTo]);

  const normalizedRange = useMemo(() => ({
    from: toCalendarBoundary(filters.dateFrom, 'start'),
    to: toCalendarBoundary(filters.dateTo, 'end'),
  }), [filters.dateFrom, filters.dateTo]);

  const buildCalendarQuery = useCallback((): CalendarEventQueryParams => ({
    from: normalizedRange.from,
    to: normalizedRange.to,
    q: filters.searchText.trim() || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    organizerId: filters.organizerId.trim() || undefined,
  }), [filters.organizerId, filters.searchText, filters.status, normalizedRange.from, normalizedRange.to]);

  const buildEventListQuery = useCallback((input: BuildEventQueryInput): EventQueryParams => ({
    from: normalizedRange.from,
    to: normalizedRange.to,
    q: filters.searchText.trim() || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    organizerId: filters.organizerId.trim() || undefined,
    page: input.page,
    limit: input.limit,
  }), [filters.organizerId, filters.searchText, filters.status, normalizedRange.from, normalizedRange.to]);

  return {
    currentMonth,
    filters,
    visibleRange,
    setFromDate,
    setToDate,
    setStatusFilter,
    setOrganizerFilter,
    setSearchText,
    goToPreviousMonth,
    goToNextMonth,
    buildCalendarQuery,
    buildEventListQuery,
  };
};
