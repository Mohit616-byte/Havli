import type { ApiSuccess, ApiError } from "./types";

/** 200 OK */
export function ok<T>(data: T, status = 200): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return Response.json(body, { status });
}

/** 201 Created */
export function created<T>(data: T): Response {
  return ok(data, 201);
}

/** 400 Bad Request — validation errors */
export function badRequest(
  message: string,
  fields?: Record<string, string>
): Response {
  const body: ApiError = {
    success: false,
    error: { code: "VALIDATION_ERROR", message, fields },
  };
  return Response.json(body, { status: 400 });
}

/** 404 Not Found */
export function notFound(message = "Not found"): Response {
  const body: ApiError = {
    success: false,
    error: { code: "NOT_FOUND", message },
  };
  return Response.json(body, { status: 404 });
}

/** 409 Conflict — e.g. duplicate interest */
export function conflict(message: string): Response {
  const body: ApiError = {
    success: false,
    error: { code: "CONFLICT", message },
  };
  return Response.json(body, { status: 409 });
}

/** 405 Method Not Allowed */
export function methodNotAllowed(): Response {
  const body: ApiError = {
    success: false,
    error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" },
  };
  return Response.json(body, { status: 405 });
}

/** 500 Internal Server Error — never exposes internals */
export function serverError(): Response {
  const body: ApiError = {
    success: false,
    error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." },
  };
  return Response.json(body, { status: 500 });
}
