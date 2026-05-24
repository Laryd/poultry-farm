'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, #f59e0b 0%, #ea580c 40%, #15803d 100%)',
        }}
      />
      {/* Blobs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-yellow-300/40 blur-3xl animate-float" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-green-400/30 blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-orange-300/30 blur-3xl animate-float-slow" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="text-5xl animate-float">🐔</span>
            <div className="text-left">
              <p className="text-2xl font-bold text-white font-display">FreshFarm</p>
              <p className="text-white/70 text-sm">Poultry Management</p>
            </div>
          </Link>
        </div>

        {/* Glass Card */}
        <div className="shop-glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/70 mb-6 text-sm">Sign in to your farm dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/20 rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:border-white/60 focus:bg-white/20 rounded-xl h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-200 bg-red-500/20 border border-red-400/30 p-3 rounded-xl">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-white text-amber-700 font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-amber-600/30 border-t-amber-700 rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-white/60">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-white font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-white/50 text-xs">
          <Link href="/shop" className="hover:text-white/80 transition-colors">
            ← Place an order without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}
