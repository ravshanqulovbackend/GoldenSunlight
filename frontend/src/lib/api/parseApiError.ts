import { AxiosError } from "axios";
import { ApiError, type ApiErrorBody } from "@/types/api";

/** DRF xatolari ikki shaklda keladi: {detail: "..."} yoki {field: ["..."]}. */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const body = (error.response?.data ?? null) as ApiErrorBody | null;
    return new ApiError(status, body, apiErrorMessage(body) ?? error.message);
  }

  return new ApiError(0, null, "An unexpected error occurred");
}

export function apiErrorMessage(body: ApiErrorBody | null): string | null {
  if (!body) return null;
  if ("detail" in body && typeof body.detail === "string") return body.detail;

  const firstKey = Object.keys(body)[0];
  if (!firstKey) return null;
  const value = (body as Record<string, string[] | string>)[firstKey];
  const text = Array.isArray(value) ? value[0] : value;
  return typeof text === "string" ? text : null;
}

/** react-hook-form's setError uchun: {field: ["msg"]} javobini [field, msg][] ga aylantiradi. */
export function apiErrorFieldEntries(body: ApiErrorBody | null): [string, string][] {
  if (!body || "detail" in body) return [];
  return Object.entries(body as Record<string, string[] | string>)
    .filter(([key]) => key !== "detail")
    .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]);
}
