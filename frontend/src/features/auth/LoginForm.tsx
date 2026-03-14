import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { validateLoginCredentials } from '@/utils/validators';
import type { LoginCredentials } from '@/types';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validate
    const validationErrors = validateLoginCredentials(credentials);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    try {
      await login(credentials);
    } catch (error) {
      const apiError = error as { message: string };
      setSubmitError(apiError.message || 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Username"
          type="text"
          value={credentials.username}
          onChange={handleChange('username')}
          error={errors.username}
          placeholder="Enter your username"
          autoComplete="username"
          autoFocus
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          value={credentials.password}
          onChange={handleChange('password')}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
}
