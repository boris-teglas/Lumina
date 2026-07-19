'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  working_hours: Record<string, { open: string; close: string; is_working: boolean }>
}

interface LoyaltyCard {
  stamps_count: number
  reward_ready: boolean
}

interface TimeSlot {
  time: string
  available: boolean
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

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

  // Time Slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

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

  // Generate next 14 days for booking strip
  const [days, setDays] = useState<{ dayName: string; dateStr: string; label: string; dayOfWeek: number }[]>([])

  useEffect(() => {
    const daysArr = []
    const locale = 'sr-RS'
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      const dayName = d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString(locale, { day: 'numeric' })
      daysArr.push({ dayName, dateStr, label, dayOfWeek: d.getDay() })
    }
    setDays(daysArr)
    setSelectedDate(daysArr[0].dateStr)
  }, [])

  // Fetch Salon and Services
  useEffect(() => {
    async function loadSalonData() {
      try {
        setLoading(true)
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

        if (salonData.theme_color) {
          document.documentElement.style.setProperty('--primary', salonData.theme_color)
        }

        const { data: servicesData, error: servicesErr } = await supabase
          .from('services')
          .select('id, name, description, duration_minutes, price')
          .eq('salon_id', salonData.id)
          .eq('is_active', true)
          .order('price', { ascending: true })

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

  // Generate time slots based on working hours & existing appointments
  const loadAvailableSlots = useCallback(async () => {
    if (!salon || !selectedDate || !selectedService) {
      setTimeSlots([])
      return
    }

    setSlotsLoading(true)
    try {
      const dateObj = new Date(selectedDate)
      const dayKey = DAY_KEYS[dateObj.getDay()]
      const workingDay = salon.working_hours?.[dayKey]

      // If salon is closed on this day
      if (!workingDay || !workingDay.is_working) {
        setTimeSlots([])
        setSlotsLoading(false)
        return
      }

      // Parse open/close times
      const [openH, openM] = workingDay.open.split(':').map(Number)
      const [closeH, closeM] = workingDay.close.split(':').map(Number)
      const openMinutes = openH * 60 + openM
      const closeMinutes = closeH * 60 + closeM

      // Generate all possible slots based on service duration
      const slotInterval = 30 // Generate a slot every 30 minutes
      const allSlots: string[] = []
      for (let m = openMinutes; m + selectedService.duration_minutes <= closeMinutes; m += slotInterval) {
        const h = Math.floor(m / 60)
        const min = m % 60
        allSlots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }

      // Fetch existing appointments for this date
      const dayStart = `${selectedDate}T00:00:00`
      const dayEnd = `${selectedDate}T23:59:59`

      const { data: existingApps } = await supabase
        .from('appointments')
        .select('start_time, end_time, status')
        .eq('salon_id', salon.id)
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd)
        .in('status', ['pending', 'confirmed'])

      // Check each slot for conflicts
      const bookedRanges = (existingApps || []).map(app => ({
        start: new Date(app.start_time).getTime(),
        end: new Date(app.end_time).getTime(),
      }))

      // Check if a slot is in the past
      const now = new Date()

      const slots: TimeSlot[] = allSlots.map(time => {
        const [slotH, slotM] = time.split(':').map(Number)
        const slotStart = new Date(`${selectedDate}T${time}:00`)
        const slotEnd = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000)

        // Don't show past slots for today
        if (slotStart < now) {
          return { time, available: false }
        }

        // Check if this slot overlaps with any booked appointment
        const hasConflict = bookedRanges.some(range => {
          return slotStart.getTime() < range.end && slotEnd.getTime() > range.start
        })

        return { time, available: !hasConflict }
      })

      setTimeSlots(slots)
    } catch (err) {
      console.error(err)
      setTimeSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [salon, selectedDate, selectedService])

  useEffect(() => {
    loadAvailableSlots()
  }, [loadAvailableSlots])

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
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('salon_id', salon?.id)
          .eq('phone', clientPhone.trim())
          .single()

        if (clientData && active) {
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

  // Handle Waitlist Signup
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon || !clientName || !clientPhone) return

    setSubmitting(true)
    try {
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
      const { data: blacklistData } = await supabase
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

  // Check if selected day is a working day
  const selectedDayObj = days.find(d => d.dateStr === selectedDate)
  const selectedDayKey = selectedDayObj ? DAY_KEYS[selectedDayObj.dayOfWeek] : null
  const isWorkingDay = selectedDayKey ? salon.working_hours?.[selectedDayKey]?.is_working : true
  const workingHoursForDay = selectedDayKey ? salon.working_hours?.[selectedDayKey] : null

  const availableCount = timeSlots.filter(s => s.available).length

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
                onClick={() => {
                  setSelectedService(srv)
                  setSelectedSlot('')
                }}
              >
                <div className="service-details">
                  <span className="service-name">{srv.name}</span>
                  <span className="service-meta">Trajanje: {srv.duration_minutes} min</span>
                  {srv.description && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{srv.description}</span>
                  )}
                </div>
                <div className="service-price">{srv.price.toLocaleString('sr-RS')} RSD</div>
              </div>
            ))}
            {services.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Salon još uvek nije dodao usluge.</p>
            )}
          </div>
        </div>

        {/* Step 2: Date & Time */}
        <div className="glass-panel section-card">
          <h3 className="section-title">
            <span style={{ color: 'var(--primary)' }}>2.</span> Izaberite datum i vreme
          </h3>

          {!selectedService && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
              Prvo izaberite uslugu iznad ↑
            </p>
          )}

          {selectedService && (
            <>
              <div className="days-strip">
                {days.map((d) => {
                  const dayKey = DAY_KEYS[d.dayOfWeek]
                  const isDayOff = !salon.working_hours?.[dayKey]?.is_working
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      className={`day-btn ${selectedDate === d.dateStr ? 'selected' : ''} ${isDayOff ? 'day-off' : ''}`}
                      onClick={() => {
                        setSelectedDate(d.dateStr)
                        setSelectedSlot('')
                      }}
                      disabled={isDayOff}
                      title={isDayOff ? 'Neradni dan' : ''}
                    >
                      <span className="day-name">{d.dayName}</span>
                      <span className="day-date">{d.label}</span>
                      {isDayOff && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>✕</span>}
                    </button>
                  )
                })}
              </div>

              {!isWorkingDay ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>😴</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Salon ne radi ovog dana. Izaberite drugi datum.
                  </p>
                </div>
              ) : slotsLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Učitavanje slobodnih termina...</p>
                </div>
              ) : !showWaitlist ? (
                <>
                  {workingHoursForDay && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Radno vreme: {workingHoursForDay.open} — {workingHoursForDay.close} · Slobodno: {availableCount} termin{availableCount === 1 ? '' : 'a'}
                    </p>
                  )}
                  <div className="slots-grid">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`slot-btn ${selectedSlot === slot.time ? 'selected' : ''} ${!slot.available ? 'booked' : ''}`}
                        onClick={() => slot.available && setSelectedSlot(slot.time)}
                        disabled={!slot.available}
                        title={!slot.available ? 'Termin je zauzet' : ''}
                      >
                        {slot.time}
                      </button>
                    ))}
                    {timeSlots.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1', padding: '12px 0' }}>
                        Nema dostupnih termina za ovaj datum.
                      </p>
                    )}
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
            </>
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
              <span className="silent-title">Želim &quot;Tihi termin&quot; 🤫</span>
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
