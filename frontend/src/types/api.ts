export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ApiErrorBody =
  | { detail: string }
  | Record<string, string[] | string>;

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message?: string) {
    super(message ?? "So'rovda xatolik yuz berdi");
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
