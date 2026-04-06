'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Shield, KeyRound } from 'lucide-react';
import { adminLogin, adminRegister } from '@/lib/api/actions/admin/auth';
import { AuthValidator, ValidationError } from '@/lib/validators';

type Tab = 'login' | 'register';
type Role = 'admin' | 'editor';

export default function AdminAuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    secret: '',
    username: '',
    password: '',
    role: 'admin' as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/check', {
          credentials: 'include',
        });
        const data = await res.json();

        if (data.authenticated) {
          router.replace('/xk92-cms/dashboard');
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };

    checkAuth();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);

    // Frontend validation
    const validation = AuthValidator.validateLogin({
      username: loginForm.username,
      password: loginForm.password,
    });

    if (!validation.success) {
      setFieldErrors(validation.errors || []);
      setError(AuthValidator.formatErrorMessage(validation.errors || []));
      return;
    }

    setLoading(true);

    const result = await adminLogin({
      username: validation.data!.username,
      password: validation.data!.password,
    });

    // Check result.success and result.user (not result.data)
    if (!result.success || !result.user) {
      setError(result.error || 'Login failed'); // result.error is the string message
      setLoading(false);
      return;
    }

    // Success - redirect
    router.replace('/xk92-cms/dashboard');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setSuccess(null);

    // Frontend validation
    const validation = AuthValidator.validateRegister({
      secret: registerForm.secret,
      username: registerForm.username,
      password: registerForm.password,
      role: registerForm.role,
    });

    if (!validation.success) {
      setFieldErrors(validation.errors || []);
      setError(AuthValidator.formatErrorMessage(validation.errors || []));
      return;
    }

    setLoading(true);

    const result = await adminRegister({
      secret: validation.data!.secret,
      username: validation.data!.username,
      password: validation.data!.password,
      role: validation.data!.role,
    });

    if (!result.success || !result.user) {
      setError(result.error || 'Registration failed');
      setLoading(false);
      return;
    }

    router.replace('/xk92-cms/dashboard');
  }

  // Helper to get field-specific error
  const getFieldError = (field: string): string | null => {
    return AuthValidator.getFieldError(fieldErrors, field);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black mb-4 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Admin Portal</h1>
          <p className="text-gray-600 text-sm mt-1">Restricted access only</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setTab('login');
                setError(null);
                setFieldErrors([]);
                setSuccess(null);
              }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors rounded-tl-lg ${
                tab === 'login'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError(null);
                setFieldErrors([]);
                setSuccess(null);
              }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors rounded-tr-lg ${
                tab === 'register'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mx-6 mt-5 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
              {success}
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Enter username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                    className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border ${
                      getFieldError('username') ? 'border-red-500' : 'border-gray-200'
                    } text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded`}
                  />
                </div>
                {getFieldError('username') && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError('username')}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white border ${
                      getFieldError('password') ? 'border-red-500' : 'border-gray-200'
                    } text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {getFieldError('password') && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError('password')}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 rounded"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Admin Secret
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showSecret ? 'text' : 'password'}
                    required
                    placeholder="Enter admin secret"
                    value={registerForm.secret}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, secret: e.target.value }))}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white border ${
                      getFieldError('secret') ? 'border-red-500' : 'border-gray-200'
                    } text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {getFieldError('secret') && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError('secret')}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Choose a username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, username: e.target.value }))}
                    className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border ${
                      getFieldError('username') ? 'border-red-500' : 'border-gray-200'
                    } text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded`}
                  />
                </div>
                {getFieldError('username') && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError('username')}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Choose a password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white border ${
                      getFieldError('password') ? 'border-red-500' : 'border-gray-200'
                    } text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {getFieldError('password') && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError('password')}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Role
                </label>
                <div className="flex gap-4 pt-1">
                  {(['admin', 'editor'] as Role[]).map((role) => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={registerForm.role === role}
                          onChange={() => setRegisterForm((p) => ({ ...p, role }))}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 border transition-colors rounded ${
                            registerForm.role === role
                              ? 'border-black bg-black'
                              : 'border-gray-400 bg-white group-hover:border-black'
                          }`}
                        >
                          {registerForm.role === role && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded" />
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-sm capitalize transition-colors ${
                          registerForm.role === role ? 'text-black font-medium' : 'text-gray-600'
                        }`}
                      >
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
                {getFieldError('role') && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError('role')}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 rounded"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Unauthorized access is prohibited</p>
      </div>
    </div>
  );
}
