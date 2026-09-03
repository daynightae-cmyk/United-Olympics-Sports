export type AdminDataMode = 'preview' | 'live';

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type SortParams = {
  field?: string;
  direction?: 'asc' | 'desc';
};

export type FilterParams = Record<string, string | number | boolean | undefined>;

export type ListQueryParams = PaginationParams & SortParams & FilterParams;

export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateResult<T> = {
  item: T;
  message: string;
};

export type UpdateResult<T> = {
  item: T;
  message: string;
};

export type DeleteResult = {
  success: boolean;
  message: string;
};