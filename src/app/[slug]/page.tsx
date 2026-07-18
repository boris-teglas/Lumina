'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import './booking.css'

interface Service {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: number
}

interface Salon {
  id: string
  name: string
  description: string
  theme_color: string
  working_hours: any
}

interface LoyaltyCard {
  stamps_count: number
  reward_ready: boolean
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params)
  const slug = resolvedParams.slug
  const supabase = createClient()

  // State
  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Booking details
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [silentAppointment, setSilentAppointment] = useState(false)

  // Loyalty Program State
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null)
  const [checkingLoyalty, setCheckingLoyalty] = useState(false)

  // Booking Results
  const [bookedAppointment, setBookedAppointment] = useState<any | null>(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Waitlist State
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'success'>('idle')

  // Generate next 7 days for booking strip
  const [days, setDays] = useState<{ dayName: string; dateStr: string; label: string }[]>([])

  useEffect(() => {
    // Generate dates
    const daysArr = []
    const locale = 'sr-RS'
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      const dayName = d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString(locale, { day: 'numeric' })
      daysArr.push({ dayName, dateStr, label })
    }
    setDays(daysArr)
    setSelectedDate(daysArr[0].dateStr)
  }, [])

  // Fetch Salon and Services
  useEffect(() => {
    async function loadSalonData() {
      try {
        setLoading(true)
        // 1. Fetch salon
        const { data: salonData, error: salonErr } = await supabase
          .from('salons')
          .select('id, name, description, theme_color, working_hours')
          .eq('slug', slug)
          .single()

        if (salonErr || !salonData) {
          setError('Salon nije pronađen. Proverite link.')
          return
        }

        setSalon(salonData)

        // Apply theme color to --primary variable dynamically!
        if (salonData.theme_color) {
          document.documentElement.style.setProperty('--primary', salonData.theme_color)
        }

        // 2. Fetch services
        const { data: servicesData, error: servicesErr } = await supabase
          .from('services')
          .select('id, name, description, duration_minutes, price')
          .eq('salon_id', salonData.id)
          .eq('is_active', true)

        if (servicesErr) {
          console.error(servicesErr)
        } else {
          setServices(servicesData || [])
        }
      } catch (err) {
        console.error(err)
        setError('Došlo je do greške pri učitavanju salona.')
      } finally {
        setLoading(false)
      }
    }

    loadSalonData()
  }, [slug])

  // Automatically check Loyalty Stamps when Phone changes (at 9+ chars)
  useEffect(() => {
    if (!salon || clientPhone.length < 9) {
      setLoyaltyCard(null)
      return
    }

    let active = true
    async function checkLoyalty() {
      setCheckingLoyalty(true)
      try {
        // Find client
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('salon_id', salon?.id)
          .eq('phone', clientPhone.trim())
          .single()

        if (clientData && active) {
          // Find card
          const { data: cardData } = await supabase
            .from('loyalty_cards')
            .select('stamps_count, reward_ready')
            .eq('client_id', clientData.id)
            .single()

          if (cardData && active) {
            setLoyaltyCard({
              stamps_count: cardData.stamps_count,
              reward_ready: cardData.reward_ready,
            })
          } else {
            setLoyaltyCard(null)
          }
        } else {
          setLoyaltyCard(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (active) setCheckingLoyalty(false)
      }
    }

    const timer = setTimeout(checkLoyalty, 600)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [clientPhone, salon])

  // Generate static mockup slots (10:00 to 16:30)
  const mockSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

  // Handle Waitlist Signup
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon || !clientName || !clientPhone) return

    setSubmitting(true)
    try {
      // 1. Create/find client
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .upsert(
          {
            salon_id: salon.id,
            full_name: clientName,
            phone: clientPhone.trim(),
            email: clientEmail || null,
          },
          { onConflict: 'salon_id,phone' }
        )
        .select()
        .single()

      if (clientErr) throw clientErr

      // 2. Add to waitlist
      const { error: waitlistErr } = await supabase.from('waitlist').insert({
        salon_id: salon.id,
        client_id: clientData.id,
        preferred_date: selectedDate,
        preferred_time_slots: ['morning', 'afternoon'],
        status: 'active',
      })

      if (waitlistErr) throw waitlistErr

      setWaitlistStatus('success')
    } catch (err) {
      console.error(err)
      alert('Greška pri upisu na listu čekanja. Molimo pokušajte ponovo.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Appointment Booking Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon || !selectedService || !selectedDate || !selectedSlot || !clientName || !clientPhone) {
      alert('Molimo popunite sva polja.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Check if user is on blacklist
      const { data: blacklistData, error: blacklistErr } = await supabase
        .from('blacklist')
        .select('requires_manual_approval, reason')
        .eq('salon_id', salon.id)
        .eq('client_phone', clientPhone.trim())
        .maybeSingle()

      const blockNeedsApproval = blacklistData?.requires_manual_approval || false

      // 2. Create or find Client Profile
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .upsert(
          {
            salon_id: salon.id,
            full_name: clientName,
            phone: clientPhone.trim(),
            email: clientEmail || null,
          },
          { onConflict: 'salon_id,phone' }
        )
        .select()
        .single()

      if (clientErr) throw clientErr

      // 3. Create Appointment
      const startTime = new Date(`${selectedDate}T${selectedSlot}:00`)
      const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000)

      const status = blockNeedsApproval ? 'pending' : 'confirmed'

      const { data: appointmentData, error: appErr } = await supabase
        .from('appointments')
        .insert({
          salon_id: salon.id,
          service_id: selectedService.id,
          client_id: clientData.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: status,
          silent_appointment: silentAppointment,
          price_charged: selectedService.price,
        })
        .select()
        .single()

      if (appErr) throw appErr

      setBookedAppointment(appointmentData)
      setPendingApproval(blockNeedsApproval)
    } catch (err) {
      console.error(err)
      alert('Došlo je do greške prilikom rezervacije. Molimo pokušajte ponovo.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="booking-container flex-center" style={{ minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="success-icon" style={{ animation: 'float 1.5s ease-in-out infinite', color: 'var(--primary)' }}>✦</div>
          <h3>Učitavanje salona...</h3>
        </div>
      </div>
    )
  }

  // Error Screen
  if (error || !salon) {
    return (
      <div className="booking-container flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel section-card" style={{ textAlign: 'center', borderColor: 'var(--danger)' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Ups! Greška</h2>
          <p>{error || 'Salon nije pronađen.'}</p>
        </div>
      </div>
    )
  }

  // Success Screen
  if (bookedAppointment) {
    return (
      <div className="booking-container">
        <div className="glass-panel success-screen animate-slide-up">
          <span className="success-icon">{pendingApproval ? '✉' : '✓'}</span>
          <h2 className="success-title">
            {pendingApproval ? 'Zahtev je poslat!' : 'Termin uspešno rezervisan!'}
          </h2>
          <p className="success-text">
            {pendingApproval ? (
              <>
                Poštovana/i <strong>{clientName}</strong>, Vaš zahtev za termin{' '}
                <strong>{selectedService?.name}</strong> dana{' '}
                <strong>{new Date(selectedDate).toLocaleDateString('sr-RS')}</strong> u{' '}
                <strong>{selectedSlot}h</strong> je poslat salonu na odobrenje.<br />
                Bićete blagovremeno obavešteni o potvrdi!
              </>
            ) : (
              <>
                Poštovana/i <strong>{clientName}</strong>, uspešno ste rezervisali termin za{' '}
                <strong>{selectedService?.name}</strong> kod{' '}
                <strong>{salon.name}</strong>.<br />
                Vidimo se <strong>{new Date(selectedDate).toLocaleDateString('sr-RS')}</strong> u{' '}
                <strong>{selectedSlot}h</strong>!
              </>
            )}
          </p>

          {/* Show Loyalty widget if reward is progress */}
          {loyaltyCard && (
            <div className="loyalty-widget" style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 24px auto' }}>
              <div className="loyalty-title">
                <span>✦</span> Vaš Loyalty Status u salonu
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {loyaltyCard.reward_ready 
                  ? 'Čestitamo! Sledeća poseta je Vaša besplatna usluga/nagrada!' 
                  : `Još ${5 - loyaltyCard.stamps_count} poseta do besplatne usluge!`}
              </p>
              <div className="stamps-row">
                {[1, 2, 3, 4, 5].map((s) => {
                  const isActive = s <= loyaltyCard.stamps_count
                  const isLast = s === 5
                  return (
                    <div key={s} className={`stamp-circle ${isActive ? 'active' : ''}`}>
                      {isLast ? '🎁' : '★'}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Nazad na zakazivanje
          </button>
        </div>
      </div>
    )
  }

  // Waitlist Success Screen
  if (waitlistStatus === 'success') {
    return (
      <div className="booking-container">
        <div className="glass-panel success-screen animate-slide-up">
          <span className="success-icon" style={{ color: 'var(--accent-gold)' }}>⏳</span>
          <h2 className="success-title">Upisani ste na listu čekanja!</h2>
          <p className="success-text">
            Ukoliko se oslobodi termin za datum{' '}
            <strong>{new Date(selectedDate).toLocaleDateString('sr-RS')}</strong>,<br />
            automatski ćemo Vas kontaktirati. Hvala na strpljenju!
          </p>
          <button className="btn btn-secondary" onClick={() => setWaitlistStatus('idle')}>
            Nazad
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-container animate-fade-in">
      {/* Header */}
      <div className="salon-header">
        <div className="salon-banner" />
        <div className="salon-logo-container">
          <div className="salon-logo-placeholder">
            {salon.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 className="salon-name">{salon.name}</h1>
        <p className="salon-desc">{salon.description || 'Dobrodošli u naš online kalendar za zakazivanje termina.'}</p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleBookingSubmit}>
        {/* Step 1: Services */}
        <div className="glass-panel section-card">
          <h3 className="section-title">
            <span style={{ color: 'var(--primary)' }}>1.</span> Izaberite uslugu
          </h3>
          <div className="services-list">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`service-item ${selectedService?.id === srv.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(srv)}
              >
                <div className="service-details">
                  <span className="service-name">{srv.name}</span>
                  <span className="service-meta">Trajanje: {srv.duration_minutes} min</span>
                  {srv.description && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{srv.description}</span>
                  )}
                </div>
                <div className="service-price">{srv.price} RSD</div>
              </div>
            ))}
            {services.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nema aktivnih usluga.</p>
            )}
          </div>
        </div>

        {/* Step 2: Date & Time */}
        <div className="glass-panel section-card">
          <h3 className="section-title">
            <span style={{ color: 'var(--primary)' }}>2.</span> Izaberite datum i vreme
          </h3>

          <div className="days-strip">
            {days.map((d) => (
              <button
                key={d.dateStr}
                type="button"
                className={`day-btn ${selectedDate === d.dateStr ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDate(d.dateStr)
                  setSelectedSlot('')
                }}
              >
                <span className="day-name">{d.dayName}</span>
                <span className="day-date">{d.label}</span>
              </button>
            ))}
          </div>

          {!showWaitlist ? (
            <>
              <div className="slots-grid">
                {mockSlots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`slot-btn ${selectedSlot === s ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Nijedan termin Vam ne odgovara?
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => setShowWaitlist(true)}
                >
                  Upis na listu čekanja
                </button>
              </div>
            </>
          ) : (
            <div className="glass-panel" style={{ padding: '16px', borderStyle: 'dashed' }}>
              <h4 style={{ color: 'var(--accent-gold)', marginBottom: '8px' }}>⏳ Prijava na listu čekanja</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Ukoliko se oslobodi bilo koji termin za datum{' '}
                <strong>{new Date(selectedDate).toLocaleDateString('sr-RS')}</strong>, bićete prvi obavešteni!
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setShowWaitlist(false)}
                >
                  Nazad na slobodne termine
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Contact & CRM Info */}
        <div className="glass-panel section-card">
          <h3 className="section-title">
            <span style={{ color: 'var(--primary)' }}>3.</span> Vaši podaci
          </h3>

          <div className="form-group">
            <label className="form-label">Ime i prezime</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Jelena Jovanović"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Broj telefona</label>
            <input
              type="tel"
              className="form-input"
              required
              placeholder="0641234567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email adresa (opciono)</label>
            <input
              type="email"
              className="form-input"
              placeholder="jelena@gmail.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>

          {/* CRM Loyalty check indicator */}
          {clientPhone.length >= 9 && (
            <div className="animate-fade-in" style={{ marginBottom: '16px' }}>
              {checkingLoyalty ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Provera loyalty statusa...</p>
              ) : loyaltyCard ? (
                <div className="loyalty-widget" style={{ padding: '12px', marginTop: '8px' }}>
                  <div className="loyalty-title" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                    <span>★</span> Prepoznat klijent! Vaš Loyalty status:
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Skupljeno {loyaltyCard.stamps_count}/5 pečata.{' '}
                    {loyaltyCard.reward_ready 
                      ? 'Poklon/popust spreman za ovaj termin!' 
                      : `Još ${5 - loyaltyCard.stamps_count} dolazaka do nagrade.`}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Silent Appointment Option */}
          <label className="silent-checkbox-wrapper">
            <input
              type="checkbox"
              checked={silentAppointment}
              onChange={(e) => setSilentAppointment(e.target.checked)}
            />
            <div className="silent-info">
              <span className="silent-title">Želim "Tihi termin" 🤫</span>
              <span className="silent-desc">Uživajte u tretmanu bez obaveze na ćaskanje.</span>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          {showWaitlist ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', background: 'var(--accent-gold)' }}
              disabled={submitting || !clientName || !clientPhone}
              onClick={handleWaitlistSubmit}
            >
              {submitting ? 'Prijava...' : 'Upiši me na listu čekanja'}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px' }}
              disabled={submitting || !selectedService || !selectedDate || !selectedSlot}
            >
              {submitting ? 'Rezervacija u toku...' : 'Potvrdi i rezerviši'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
