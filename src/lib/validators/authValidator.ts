import { ValidationResult, ValidationError, LoginData, RegisterData } from './types';
import { AdminValidator } from './adminValidator';

export class AuthValidator {
  static validateLogin(data: LoginData): ValidationResult<LoginData> {
    const errors = [
      ...AdminValidator.validateUsername(data.username),
      ...AdminValidator.validatePassword(data.password),
    ];

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: {
        username: data.username.trim(),
        password: data.password,
      },
    };
  }

  static validateRegister(data: RegisterData): ValidationResult<RegisterData> {
    const errors = [
      ...AdminValidator.validateSecret(data.secret),
      ...AdminValidator.validateUsername(data.username),
      ...AdminValidator.validatePassword(data.password),
      ...AdminValidator.validateRole(data.role),
    ];

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: {
        secret: data.secret.trim(),
        username: data.username.trim(),
        password: data.password,
        role: data.role,
      },
    };
  }

  static formatErrorMessage(errors: ValidationError[]): string {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0].message;
    return errors.map((err) => err.message).join(', ');
  }

  static getFieldError(errors: ValidationError[], field: string): string | null {
    const error = errors.find((err) => err.field === field);
    return error ? error.message : null;
  }
}
