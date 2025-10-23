'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t('auth.emailRequired'));
      return;
    }
    if (!password) {
      setError(t('auth.passwordRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const data = await authAPI.login(email, password);

      if (!data.success) {
        setError(t('auth.invalidCredentials'));
        setIsLoading(false);
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
      }));

      router.push(`/${locale}`);
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.loginError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center mb-4 shadow-md">
              <span className="text-white font-bold text-2xl">
                {t('app.logoLetter')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-sm text-gray-600 text-center">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className={cn(
                  "absolute inset-y-0 flex items-center pointer-events-none",
                  isRtl ? "right-0 pr-3" : "left-0 pl-3"
                )}>
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className={cn(
                    isRtl ? "pr-10" : "pl-10"
                  )}
                  dir="ltr"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className={cn(
                  "absolute inset-y-0 flex items-center pointer-events-none",
                  isRtl ? "right-0 pr-3" : "left-0 pl-3"
                )}>
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={cn(
                    isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors",
                    isRtl ? "left-0 pl-3" : "right-0 pr-3"
                  )}
                  disabled={isLoading}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
