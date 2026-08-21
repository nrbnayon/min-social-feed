/**
 * Generic application error with an HTTP status code.
 * Throw this from any service layer; the error middleware will handle it.
 */
export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    // Restore prototype chain (needed when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Convenience alias — Auth-specific errors (400/401/403/409).
 * Kept as a named subclass so existing `instanceof AuthError` checks still work.
 */
export class AuthError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
    this.name = "AuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
