export enum ErrorCode {
  MISSING_FIELDS = "Missing fields",
  REGISTRATION_FAILED = "Registration failed",
  LOGIN_FAILED = "Login failed",
  INCORRECT_CREDENTIALS = "Incorrect credentials",
  USER_NOT_FOUND = "User not found",
  INVALID_PASSWORD = "Invalid password",
  INVALID_EMAIL = "Invalid email",
  EMAIL_ALREADY_EXISTS = "Email already exists",
  USER_ALREADY_EXISTS = "User already exists",
  ACCOUNT_NOT_VERIFIED = "Account not verified",
  INVALID_TOKEN = "Invalid token",
  EXPIRED_TOKEN = "Expired token",
  USED_TOKEN = "Token already used",
  INTERNAL_ERROR = "Internal error",
}

export class RegistrationError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
