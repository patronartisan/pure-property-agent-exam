import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../httpError";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  const httpError = err instanceof HttpError ? err : null;
  const status = httpError?.status || 500;
  const payload: {
    error: { code: string; message: string; details?: string[] };
  } = {
    error: {
      code: httpError?.code || "INTERNAL_ERROR",
      message: status >= 500 ? "Something went wrong" : httpError?.message || "Something went wrong",
    },
  };

  if (httpError?.details) {
    payload.error.details = httpError.details;
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(payload);
}
