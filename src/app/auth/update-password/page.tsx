'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import '../auth.css'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Lozinke se ne poklapaju.')
      return
    }

    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Lozinka je uspešno promenjena! Preusmeravanje na nadzornu tablu...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch {
      setError('Došlo je do greške pri izmeni lozinke.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glass-card">
        <div className="auth-logo">
          <div className="auth-logo-text">✦ GlowLink</div>
          <p className="auth-tagline">Postavite novu lozinku za vaš nalog</p>
        </div>

        <div className="auth-form-wrapper">
          {error && (
            <div className="auth-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-success">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                Nova lozinka
              </label>
              <input
                id="new-password"
                className="form-input"
                type="password"
                placeholder="Minimum 6 karaktera"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-password">
                Potvrdite novu lozinku
              </label>
              <input
                id="confirm-new-password"
                className="form-input"
                type="password"
                placeholder="Ponovite novu lozinku"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                'Sačuvaj novu lozinku'
              )}
            </button>
          </form>
        </div>

        <div className="auth-back-link">
          <Link href="/auth">← Nazad na prijavu</Link>
        </div>
      </div>
    </div>
  )
}
