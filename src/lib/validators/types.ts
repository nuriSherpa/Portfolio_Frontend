export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  secret: string;
  username: string;
  password: string;
  role: 'admin' | 'editor';
}
