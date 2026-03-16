'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AxiosError } from 'axios';

const inputClass =
  'w-full px-3.5 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-[10px] text-[var(--text-primary)] text-sm outline-none transition-colors focus:border-[var(--accent-green)]';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as Record<string, unknown>;
        setError((data.message as string) || 'Authentication failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-[var(--bg-card)] rounded-[20px] p-10 border border-[var(--border-color)]">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold text-[#111119]">
            T
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] m-0">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1.5">
            {isRegister ? 'Sign up for Tenpistas' : 'Login to Tenpistas Dashboard'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/30 text-[var(--accent-red)] px-3.5 py-2.5 rounded-lg text-[13px] mb-5 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <div>
            <label htmlFor="username" className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-1 bg-[var(--accent-green)] text-[#111119] rounded-[10px] text-[15px] font-semibold cursor-pointer transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-6 text-[13px] text-[var(--text-secondary)]">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="bg-transparent border-none text-[var(--accent-green)] cursor-pointer font-semibold text-[13px] hover:underline"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
