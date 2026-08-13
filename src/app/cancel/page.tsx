'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Calendar, Clock, AlertTriangle, CheckCircle2, ArrowLeft, PhoneCall } from 'lucide-react'

function CancelBookingContent() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<any>(null)
  const [cancelled, setCancelled] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hoursLeft, setHoursLeft] = useState<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!appointmentId) {
      setErrorMessage('Nevažeći ili nedostajući identifikator rezervacije.')
      setLoading(false)
      return
    }

    async function loadAppointment() {
      try {
        let data: any = null

        // 1. Direct Supabase query (works client-side with RLS policies)
        try {
          const { data: sbData } = await supabase
            .from('appointments')
            .select(`
              id,
              start_time,
              end_time,
              status,
              salons ( id, name, slug, theme_color ),
              services ( name, price, duration_minutes ),
              clients ( full_name, phone, email )
            `)
            .eq('id', appointmentId)
            .maybeSingle()

          if (sbData) data = sbData
        } catch (e) {
          console.warn('Direct Supabase fetch fallback error:', e)
        }

        // 2. Server API fallback if direct query returned null
        if (!data) {
          try {
            const res = await fetch(`/api/cancel-booking?id=${encodeURIComponent(appointmentId!)}`)
            if (res.ok) {
              const json = await res.json()
              data = json.appointment
            }
          } catch (e) {
            console.warn('API route fetch fallback error:', e)
          }
        }

        if (!data) {
          setErrorMessage('Termin nije pronađen ili je link nevažeći.')
          return
        }

        setAppointment(data)

        if (data.status === 'cancelled') {
          setCancelled(true)
        }

        const startTime = new Date(data.start_time)
        const now = new Date()
        const diffMs = startTime.getTime() - now.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        setHoursLeft(diffHours)
      } catch (err: any) {
        console.error(err)
        setErrorMessage('Došlo je do greške prilikom učitavanja termina.')
      } finally {
        setLoading(false)
      }
    }

    loadAppointment()
  }, [appointmentId])

  const handleConfirmCancel = async () => {
    if (!appointment) return

    setCancelling(true)
    try {
      // 1. Update status in Supabase directly
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointment.id)

      if (error) {
        // Fallback to server API endpoint
        const res = await fetch('/api/cancel-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId: appointment.id })
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Greška pri otkazivanju.')
      } else {
        // Notify salon owner via email
        const startDate = new Date(appointment.start_time)
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cancellation_notification',
            appointmentId: appointment.id,
            salonSlug: appointment.salons?.slug,
            salonName: appointment.salons?.name,
            serviceName: appointment.services?.name || 'Usluga',
            clientName: appointment.clients?.full_name || 'Klijent',
            clientPhone: appointment.clients?.phone || '',
            date: startDate.toLocaleDateString('sr-RS'),
            time: startDate.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
          })
        }).catch(e => console.warn(e))
      }

      setCancelled(true)
    } catch (err: any) {
      console.error(err)
      alert('Greška pri otkazivanju termina: ' + err.message)
    } finally {
      setCancelling(false)
    }
  }

  const salonTheme = appointment?.salons?.theme_color || '#ec4899'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800, color: salonTheme, display: 'inline-block' }}>
            ✦ GlowLink
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '8px', color: '#ffffff' }}>
            Otkazivanje Termina
          </h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
            <p>Učitavanje detalja rezervacije...</p>
          </div>
        ) : errorMessage ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{!appointmentId ? '📩' : '⚠️'}</div>
            <h3 style={{ color: !appointmentId ? 'var(--primary, #ec4899)' : '#f87171', marginBottom: '8px' }}>
              {!appointmentId ? 'Otvorite link iz e-maila' : 'Termin nije pronađen'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
              {!appointmentId ? (
                <>
                  Ova stranica služi za otkazivanje termina putem sigurnog linka koji dobijate u e-mail potvrdi rezervacije.<br /><br />
                  Molimo Vas otvorite e-mail koji Vam je stigao nakon zakazivanja i kliknite na dugme <strong>&quot;Otkaži termin online&quot;</strong>.
                </>
              ) : (
                errorMessage
              )}
            </p>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '10px 20px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              <ArrowLeft size={16} /> Nazad na naslovnu
            </Link>
          </div>
        ) : cancelled ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.15)',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.3rem', color: '#4ade80', marginBottom: '8px' }}>
              Termin je uspešno otkazan
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
              Vaša rezervacija u salonu <strong>{appointment?.salons?.name}</strong> je stornirana. Hvala Vam što ste otkazali na vreme kako bi drugi klijenti mogli da zauzmu termin!
            </p>

            {appointment?.salons?.slug && (
              <Link href={`/${appointment.salons.slug}`} style={{
                display: 'inline-block',
                background: salonTheme,
                color: '#ffffff',
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.95rem'
              }}>
                Pogledaj ponudu salona i novi termin
              </Link>
            )}
          </div>
        ) : hoursLeft !== null && hoursLeft < 5 ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.2rem', color: '#f87171', marginBottom: '8px' }}>
              Kasno otkazivanje online
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '16px' }}>
              Online otkazivanje preko linka je moguće najkasnije <strong>5 sati pre početka termina</strong>.
            </p>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '0.85rem'
            }}>
              <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Status termina:</div>
              <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '12px' }}>
                {new Date(appointment.start_time).toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long' })} u {new Date(appointment.start_time).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}h
                {hoursLeft > 0 ? ` (za manje od ${Math.ceil(hoursLeft)}h)` : ' (termin je prošao)'}
              </div>

              <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Pošto je termin uskoro, molimo Vas pozovite salon direktno telefonom radi otkazivanja:
              </p>

              {appointment?.salons?.phone ? (
                <a href={`tel:${appointment.salons.phone}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(236, 72, 153, 0.2)',
                  color: '#f472b6',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  marginTop: '12px',
                  fontSize: '0.95rem'
                }}>
                  <PhoneCall size={16} /> Pozovi salon ({appointment.salons.phone})
                </a>
              ) : (
                <div style={{ color: '#f472b6', fontWeight: 600, marginTop: '8px' }}>
                  Kontaktirajte salon direktno.
                </div>
              )}
            </div>

            <Link href={`/${appointment?.salons?.slug || ''}`} style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'underline' }}>
              Nazad na profil salona
            </Link>
          </div>
        ) : (
          /* Normal Cancellation confirmation screen (>= 5 hours left) */
          <div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Salon
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
                {appointment?.salons?.name}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Calendar size={16} style={{ color: salonTheme }} />
                  <span>
                    {new Date(appointment.start_time).toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Clock size={16} style={{ color: salonTheme }} />
                  <span>
                    {new Date(appointment.start_time).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}h ({appointment?.services?.duration_minutes || 30} min)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Usluga:</span>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{appointment?.services?.name}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              fontSize: '0.8rem',
              color: '#f87171',
              lineHeight: '1.4'
            }}>
              ℹ️ Otkazivanjem oslobađate ovaj termin za druge klijente koji čekaju u redu.
            </div>

            <button
              type="button"
              disabled={cancelling}
              onClick={handleConfirmCancel}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: cancelling ? 'not-allowed' : 'pointer',
                opacity: cancelling ? 0.7 : 1,
                boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)'
              }}
            >
              {cancelling ? 'Otkazivanje u toku...' : '❌ Potvrdi Otkazivanje Termina'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CancelBookingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Učitavanje...
      </div>
    }>
      <CancelBookingContent />
    </Suspense>
  )
}
