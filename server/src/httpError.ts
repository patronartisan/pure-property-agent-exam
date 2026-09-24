export class HttpError extends Error {
  status: number;
  code: string;
  details?: string[];

  constructor(status: number, code: string, message: string, details?: string[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function validationError(details: string[]) {
  return new HttpError(400, "VALIDATION_ERROR", "Request validation failed", details);
}
