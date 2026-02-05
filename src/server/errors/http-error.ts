export interface HttpErrorOptions {
  status?: number;
  code?: string;
  details?: unknown;
}
export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, opts: HttpErrorOptions = {}) {
    super(message);
    this.name = "HttpError";
    this.status = opts.status ?? 500;
    this.code = opts.code;
    this.details = opts.details;
  }
  toResponse() {
    return Response.json(
      {
        error: this.message,
        code: this.code,
        details: this.details,
      },
      { status: this.status }
    );
  }
}