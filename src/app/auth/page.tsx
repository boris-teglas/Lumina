'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import './auth.css'

type AuthTab = 'login' | 'register'

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
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
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
          <div className="auth-logo-text">✦ GlowLink</div>
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
                <label className="form-label" htmlFor="login-password">
                  Lozinka
                </label>
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
        <Link href="/dashboard?demo=true">
          <button type="button" className="btn btn-secondary auth-demo-btn">
            <span>🎭</span>
            Vidi Demo mod (bez registracije)
          </button>
        </Link>

        {/* Back Link */}
        <div className="auth-back-link">
          <Link href="/">← Nazad na početnu stranu</Link>
        </div>
      </div>
    </div>
  )
}
