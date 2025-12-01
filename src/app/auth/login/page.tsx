// Giriş Sayfası (Login Page)
// Supabase Auth ile kullanıcı girişi - Modern tasarım

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail, Lock, Eye, EyeOff, QrCode, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form gönderimi - Supabase Auth (Form submission)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Hata mesajlarını Türkçeleştir (Translate error messages)
        if (authError.message === 'Invalid login credentials') {
          setError('Geçersiz e-posta veya şifre')
        } else if (authError.message === 'Email not confirmed') {
          setError('E-posta adresinizi doğrulamanız gerekiyor')
        } else {
          setError(authError.message)
        }
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  // Google ile giriş - Supabase OAuth (Google sign in)
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    }
  }

  // Özellik listesi (Feature list)
  const features = [
    { icon: Sparkles, text: 'Sınırsız QR Kod Oluşturma' },
    { icon: Shield, text: 'Güvenli ve Hızlı' },
    { icon: Zap, text: 'Anında İndirme' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sol Panel - Görsel ve Bilgi (Left Panel - Visual and Info) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Arka plan desenleri (Background patterns) */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* İçerik (Content) */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">QRCodeGen</span>
          </Link>

          {/* Başlık (Title) */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            QR Kodlarınızı<br />
            <span className="text-blue-200">Kolayca Yönetin</span>
          </h1>
          <p className="text-lg text-blue-100 mb-10 max-w-md">
            Profesyonel QR kodlar oluşturun, tarama istatistiklerini takip edin ve işletmenizi büyütün.
          </p>

          {/* Özellikler (Features) */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Alt bilgi (Footer info) */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-blue-200 text-sm">
              10 milyondan fazla kullanıcı tarafından tercih ediliyor
            </p>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
              <span className="text-white ml-2 text-sm">4.9/5 puan</span>
            </div>
          </div>
        </div>

        {/* Dekoratif QR kod - Sabit desen (Decorative QR code - Fixed pattern) */}
        <div className="absolute bottom-10 right-10 w-32 h-32 opacity-20">
          <div className="grid grid-cols-5 gap-1">
            {/* Sabit QR deseni - hydration hatası önlemek için */}
            {[1,0,1,1,0, 0,1,0,1,1, 1,1,1,0,0, 0,0,1,1,1, 1,0,0,1,0].map((filled, i) => (
              <div key={i} className={`w-full aspect-square rounded-sm ${filled ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Sağ Panel - Form (Right Panel - Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobil Logo (Mobile Logo) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">QRCodeGen</span>
          </div>

          {/* Form Başlığı (Form Header) */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('loginTitle')}</h2>
            <p className="text-gray-600">{t('loginSubtitle')}</p>
          </div>

          {/* Google ile Giriş (Google Sign In) */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">{t('google')}</span>
          </button>

          {/* Ayırıcı (Divider) */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">{t('orContinueWith')}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hata mesajı (Error message) */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xs">!</span>
                </div>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Şifre (Password) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Beni hatırla & Şifremi unuttum (Remember me & Forgot password) */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">{t('rememberMe')}</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {t('forgotPassword')}
              </Link>
            </div>

            {/* Giriş butonu (Login button) */}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
              isLoading={isLoading}
            >
              <span className="flex items-center justify-center gap-2">
                {t('login')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </form>

          {/* Kayıt linki (Register link) */}
          <p className="text-center text-gray-600 mt-8">
            {t('noAccount')}{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

