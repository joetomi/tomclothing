'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'كلمة المرور غير صحيحة');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-tom-paper flex items-center justify-center p-6 text-right">
      <div className="w-full max-w-md bg-white border border-tom-stone p-8 sm:p-10 space-y-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="relative h-10 w-36 mx-auto">
            <Image
              src="/brand/logo-black.png"
              alt="TOM Admin"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs uppercase tracking-widest text-tom-muted">
            لوحة الإدارة والمحتوى — CMS ADMIN
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 justify-end">
            <span>{error}</span>
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-tom-black uppercase tracking-wider block">
              كلمة مرور الإدارة
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخلي كلمة المرور..."
                className="w-full pl-10 pr-4 py-3 bg-tom-sand border border-tom-stone text-tom-black text-sm focus:outline-none focus:border-tom-black transition-colors"
              />
              <Lock className="w-4 h-4 text-tom-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-tom-black text-white text-xs uppercase tracking-widest hover:bg-tom-charcoal transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-tom-stone/50">
          <a href="/" className="text-xs text-tom-muted hover:text-tom-black underline">
            ← العودة للموقع الرئيسي
          </a>
        </div>
      </div>
    </main>
  );
}
