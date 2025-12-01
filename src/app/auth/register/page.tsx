// Kayıt Sayfası (Register Page)
// Supabase Auth ile yeni kullanıcı kaydı - Modern tasarım

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, QrCode, Sparkles, Shield, Zap, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form gönderimi - Supabase Auth (Form submission)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Şifre kontrolü (Password validation)
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setIsLoading(false)
      return
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        // Hata mesajlarını Türkçeleştir (Translate error messages)
        if (authError.message.includes('already registered')) {
          setError('Bu e-posta adresi zaten kayıtlı')
        } else if (authError.message.includes('valid email')) {
          setError('Geçerli bir e-posta adresi girin')
        } else {
          setError(authError.message)
        }
      } else {
        // Başarılı kayıt - email doğrulama mesajı (Success - email verification)
        setSuccess(true)
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  // Google ile kayıt - Supabase OAuth (Google sign up)
  const handleGoogleSignUp = async () => {
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

  // Plan özellikleri (Plan features)
  const planFeatures = [
    '2 Ücretsiz QR Kod',
    '10 Gün Geçerlilik',
    'PNG & SVG İndirme',
    'Temel Özelleştirme',
  ]

  // Başarılı kayıt mesajı (Success message)
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Kayıt Başarılı! 🎉</h2>
          <p className="text-gray-600 mb-2">
            Doğrulama e-postası gönderildi:
          </p>
          <p className="font-semibold text-gray-900 mb-6 bg-gray-100 py-2 px-4 rounded-lg">
            {email}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Hesabınızı aktifleştirmek için e-postanızdaki linke tıklayın. Spam klasörünü de kontrol etmeyi unutmayın.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl"
          >
            Giriş Sayfasına Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol Panel - Görsel ve Bilgi (Left Panel - Visual and Info) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Arka plan desenleri (Background patterns) */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
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
            Hemen Ücretsiz<br />
            <span className="text-pink-200">Hesap Oluşturun</span>
          </h1>
          <p className="text-lg text-purple-100 mb-10 max-w-md">
            Dakikalar içinde profesyonel QR kodlar oluşturmaya başlayın. Kredi kartı gerekmez.
          </p>

          {/* Ücretsiz Plan Özellikleri (Free plan features) */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-10">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Ücretsiz Planda Neler Var?
            </h3>
            <div className="space-y-3">
              {planFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-300" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>

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
        </div>

        {/* Dekoratif QR kod - Sabit desen (Decorative QR code - Fixed pattern) */}
        <div className="absolute bottom-10 right-10 w-32 h-32 opacity-20">
          <div className="grid grid-cols-5 gap-1">
            {/* Sabit QR deseni - hydration hatası önlemek için */}
            {[0,1,1,0,1, 1,0,1,0,0, 1,1,0,1,1, 0,1,0,0,1, 1,0,1,1,0].map((filled, i) => (
              <div key={i} className={`w-full aspect-square rounded-sm ${filled ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Sağ Panel - Form (Right Panel - Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobil Logo (Mobile Logo) */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">QRCodeGen</span>
          </div>

          {/* Form Başlığı (Form Header) */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('registerTitle')}</h2>
            <p className="text-gray-600">{t('registerSubtitle')}</p>
          </div>

          {/* Google ile Kayıt (Google Sign Up) */}
          <button
            onClick={handleGoogleSignUp}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hata mesajı (Error message) */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xs">!</span>
                </div>
                {error}
              </div>
            )}

            {/* İsim (Name) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
              <p className="text-xs text-gray-500 mt-1.5 ml-1">Minimum 6 karakter</p>
            </div>

            {/* Şifre Tekrar (Confirm Password) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Şartlar ve Koşullar (Terms) */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                required
              />
              <span className="text-sm text-gray-600">
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">Gizlilik Politikası</Link>
                {' '}ve{' '}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">Kullanım Koşulları</Link>
                &apos;nı kabul ediyorum.
              </span>
            </div>

            {/* Kayıt butonu (Register button) */}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all mt-2"
              isLoading={isLoading}
            >
              <span className="flex items-center justify-center gap-2">
                {t('register')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </form>

          {/* Giriş linki (Login link) */}
          <p className="text-center text-gray-600 mt-8">
            {t('hasAccount')}{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

