import { ValidationResult, ValidationError } from './types';

export class AdminValidator {
  private static readonly VALIDATION_RULES = {
    SECRET_MIN_LENGTH: 1,
    USERNAME_MIN_LENGTH: 3,
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MAX_LENGTH: 50,
    PASSWORD_MAX_LENGTH: 100,
    SECRET_MAX_LENGTH: 100,
  };

  static validateSecret(secret: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!secret || secret.trim().length === 0) {
      errors.push({
        field: 'secret',
        message: 'Admin secret is required',
        code: 'SECRET_REQUIRED',
      });
    } else if (secret.length > this.VALIDATION_RULES.SECRET_MAX_LENGTH) {
      errors.push({
        field: 'secret',
        message: `Secret must not exceed ${this.VALIDATION_RULES.SECRET_MAX_LENGTH} characters`,
        code: 'SECRET_TOO_LONG',
      });
    }

    return errors;
  }

  static validateUsername(username: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!username || username.trim().length === 0) {
      errors.push({
        field: 'username',
        message: 'Username is required',
        code: 'USERNAME_REQUIRED',
      });
    } else if (username.length < this.VALIDATION_RULES.USERNAME_MIN_LENGTH) {
      errors.push({
        field: 'username',
        message: `Username must be at least ${this.VALIDATION_RULES.USERNAME_MIN_LENGTH} characters long`,
        code: 'USERNAME_TOO_SHORT',
      });
    } else if (username.length > this.VALIDATION_RULES.USERNAME_MAX_LENGTH) {
      errors.push({
        field: 'username',
        message: `Username must not exceed ${this.VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`,
        code: 'USERNAME_TOO_LONG',
      });
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, and underscores',
        code: 'USERNAME_INVALID_CHARS',
      });
    }

    return errors;
  }

  static validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!password || password.length === 0) {
      errors.push({
        field: 'password',
        message: 'Password is required',
        code: 'PASSWORD_REQUIRED',
      });
    } else if (password.length < this.VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.push({
        field: 'password',
        message: `Password must be at least ${this.VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
        code: 'PASSWORD_TOO_SHORT',
      });
    } else if (password.length > this.VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
      errors.push({
        field: 'password',
        message: `Password must not exceed ${this.VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`,
        code: 'PASSWORD_TOO_LONG',
      });
    }

    return errors;
  }

  static validateRole(role: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const validRoles = ['admin', 'editor'];

    if (!role) {
      errors.push({
        field: 'role',
        message: 'Role is required',
        code: 'ROLE_REQUIRED',
      });
    } else if (!validRoles.includes(role)) {
      errors.push({
        field: 'role',
        message: 'Invalid role selected',
        code: 'INVALID_ROLE',
      });
    }

    return errors;
  }
}
