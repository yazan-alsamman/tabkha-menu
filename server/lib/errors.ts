import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ApiErrorBody = {
  error: string;
  code: string;
  details?: Record<string, string>;
};

export class HttpError extends Error {
  status: number;
  code: string;
  details?: Record<string, string>;

  constructor(status: number, code: string, error: string, details?: Record<string, string>) {
    super(error);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorBody(error: unknown): { status: number; body: ApiErrorBody } {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      body: { error: error.message, code: error.code, details: error.details },
    };
  }
  console.error(error);
  return {
    status: 500,
    body: { error: "Something went wrong. Please try again.", code: "internal_error" },
  };
}

export function jsonError(c: Context, error: unknown) {
  const { status, body } = errorBody(error);
  return c.json(body, status as ContentfulStatusCode);
}
