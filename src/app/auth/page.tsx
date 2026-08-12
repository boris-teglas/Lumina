'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Sparkles } from 'lucide-react'
import './auth.css'

type AuthTab = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()

    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      router.push('/auth/update-password' + window.location.hash)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/auth/update-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab)
    setError(null)
    setSuccess(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Došlo je do greške. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/callback?next=/auth/update-password`
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: redirectUrl,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Uputstvo za resetovanje lozinke je poslato na vaš e-mail! Proverite inboks.')
      }
    } catch {
      setError('Došlo je do greške pri slanju zahteva za resetovanje.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (regPassword !== regConfirm) {
      setError('Lozinke se ne poklapaju.')
      return
    }

    if (regPassword.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: regName,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Nalog je uspešno kreiran! Proverite email za potvrdu.')
      }
    } catch {
      setError('Došlo je do greške. Pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glass-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)' }} /> GlowLink
          </div>
          <p className="auth-tagline">Pametan booking za salone lepote</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${activeTab === 'login' ? ' active' : ''}`}
            onClick={() => switchTab('login')}
            type="button"
          >
            Prijava
          </button>
          <button
            className={`auth-tab${activeTab === 'register' ? ' active' : ''}`}
            onClick={() => switchTab('register')}
            type="button"
          >
            Registracija
          </button>
          <div
            className="auth-tabs-indicator"
            style={{ left: activeTab === 'login' ? '0%' : '50%' }}
          />
        </div>

        {/* Form Area */}
        <div className="auth-form-wrapper">
          {/* Error Message */}
          {error && (
            <div className="auth-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-success">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin} key="login">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email adresa
                </label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  placeholder="vas@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password">
                    Lozinka
                  </label>
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    style={{ background: 'none', border: 'none', color: '#ec4899', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                  >
                    Zaboravili ste lozinku?
                  </button>
                </div>
                <input
                  id="login-password"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  'Prijavi se'
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === 'forgot' && (
            <form className="auth-form" onSubmit={handleForgotPassword} key="forgot">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                Unesite vašu email adresu i poslaćemo vam link za resetovanje lozinke.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  Email adresa
                </label>
                <input
                  id="forgot-email"
                  className="form-input"
                  type="email"
                  placeholder="vas@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  'Pošalji link za reset'
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  ← Nazad na prijavu
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form className="auth-form" onSubmit={handleRegister} key="register">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Ime i prezime
                </label>
                <input
                  id="reg-name"
                  className="form-input"
                  type="text"
                  placeholder="Ana Petrović"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email adresa
                </label>
                <input
                  id="reg-email"
                  className="form-input"
                  type="email"
                  placeholder="vas@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Lozinka
                </label>
                <input
                  id="reg-password"
                  className="form-input"
                  type="password"
                  placeholder="Minimum 6 karaktera"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">
                  Potvrdi lozinku
                </label>
                <input
                  id="reg-confirm"
                  className="form-input"
                  type="password"
                  placeholder="Ponovite lozinku"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  'Kreiraj nalog'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span className="auth-divider-text">ili</span>
        </div>

        {/* Demo Button */}
        <Link href="/dashboard?demo=true" className="btn btn-secondary auth-demo-btn">
          <span>🎭</span>
          Vidi Demo mod (bez registracije)
        </Link>

        {/* Back Link */}
        <div className="auth-back-link">
          <Link href="/">← Nazad na početnu stranu</Link>
        </div>
      </div>
    </div>
  )
}
