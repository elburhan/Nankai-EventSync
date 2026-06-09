import { EVENT_LIST_DEFAULT_LIMIT, EVENT_LIST_MAX_LIMIT } from '../constants/event-limit';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export const resolvePagination = (query: PaginationQuery): { page: number; limit: number; skip: number } => {
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(Math.max(query.limit ?? EVENT_LIST_DEFAULT_LIMIT, 1), EVENT_LIST_MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta => {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.max(Math.ceil(totalItems / limit), 1),
  };
};
