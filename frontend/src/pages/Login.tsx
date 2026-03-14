import { Navigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Card } from '@/components/Card';
import { LoginForm } from '@/features/auth/LoginForm';
import { useAuth } from '@/features/auth/useAuth';

export function Login() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-600/20">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CIMCO Inventory</h1>
          <p className="text-slate-400 mt-1">Sign in to manage your parts</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8">
          <LoginForm />
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          CIMCO Inventory System v2
        </p>
      </div>
    </div>
  );
}
