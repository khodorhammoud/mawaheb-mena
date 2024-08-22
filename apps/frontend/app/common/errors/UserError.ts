export enum ErrorCode {
  MISSING_FIELDS = "MISSING_FIELDS",
  REGISTRATION_FAILED = "REGISTRATION_FAILED",
  LOGIN_FAILED = "LOGNI_FAILED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  INVALID_EMAIL = "INVALID_EMAIL",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
}

export class RegistrationError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
