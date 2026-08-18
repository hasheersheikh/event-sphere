import { Request } from 'express';

export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Extract pagination parameters from request query
 */
export function getPaginationParams(req: Request, defaultLimit = 20, maxLimit = 100): {
  skip: number;
  limit: number;
  page: number;
} {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  let limit = parseInt(req.query.limit as string) || defaultLimit;

  // Cap the limit at maxLimit
  limit = Math.min(limit, maxLimit);
  limit = Math.max(1, limit);

  const skip = (page - 1) * limit;

  return { skip, limit, page };
}

/**
 * Create paginated response object with metadata
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Add pagination headers to response
 */
export function setPaginationHeaders(
  res: any,
  page: number,
  limit: number,
  total: number
): void {
  const totalPages = Math.ceil(total / limit);

  res.setHeader('X-Pagination-Page', page.toString());
  res.setHeader('X-Pagination-Limit', limit.toString());
  res.setHeader('X-Pagination-Total', total.toString());
  res.setHeader('X-Pagination-Total-Pages', totalPages.toString());
  res.setHeader('X-Pagination-Has-Next', (page < totalPages).toString());
  res.setHeader('X-Pagination-Has-Prev', (page > 1).toString());
}
