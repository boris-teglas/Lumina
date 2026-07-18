'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import './dashboard.css'

interface Service {
  id: string
  name: string
  price: number
  duration_minutes?: number
  description?: string
  is_active?: boolean
}

interface Appointment {
  id: string
  client_id: string
  client_name: string
  client_phone: string
  service_name: string
  start_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  silent_appointment: boolean
  price_charged: number
}

interface Client {
  id: string
  full_name: string
  phone: string
  email: string
  notes: string
  total_bookings: number
  is_blacklisted: boolean
}

export default function Dashboard() {
  const supabase = createClient()
  
  // Auth state
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  // Navigation
  const [activeTab, setActiveTab] = useState<'stats' | 'calendar' | 'crm' | 'services' | 'story' | 'settings'>('stats')

  // Core Data State
  const [salon, setSalon] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [blacklistPhones, setBlacklistPhones] = useState<string[]>([])
  const [waitlistCount, setWaitlistCount] = useState(0)

  // Selected entities for editing
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [crmNotesText, setCrmNotesText] = useState('')

  // Services form state
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('30')
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

  // HTML5 Canvas story configuration
  const [storyBgPrimary, setStoryBgPrimary] = useState('#09090b')
  const [storyBgSecondary, setStoryBgSecondary] = useState('#1e1b4b')
  const [storyThemeColor, setStoryThemeColor] = useState('#ec4899')
  const [storySlotsText, setStorySlotsText] = useState('PETAK: 11:00, 14:00, 16:30\nSUBOTA: 10:00, 12:30')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Mock data for Quick Demo mode
  const loadMockData = () => {
    setSalon({
      id: 'mock-salon-id',
      name: 'Nails & Lashes by Jelena',
      slug: 'jelena-nokti',
      theme_color: '#ec4899',
      description: 'Sve za Vaš savršen izgled na jednom mestu.'
    })
    
    setServices([
      { id: 's1', name: 'Izlivanje noktiju', price: 2500 },
      { id: 's2', name: 'Korekcija noktiju', price: 1800 },
      { id: 's3', name: 'Gel lak', price: 1200 },
      { id: 's4', name: 'Svilene trepavice', price: 3000 }
    ])

    setAppointments([
      {
        id: 'a1',
        client_id: 'c1',
        client_name: 'Milica Petrović',
        client_phone: '065111222',
        service_name: 'Izlivanje noktiju',
        start_time: new Date(Date.now() + 3600000).toISOString(), // in 1 hour
        status: 'confirmed',
        silent_appointment: true,
        price_charged: 2500
      },
      {
        id: 'a2',
        client_id: 'c2',
        client_name: 'Ana Marić',
        client_phone: '066333444',
        service_name: 'Gel lak',
        start_time: new Date(Date.now() + 7200000).toISOString(), // in 2 hours
        status: 'pending', // Needs approval!
        silent_appointment: false,
        price_charged: 1200
      },
      {
        id: 'a3',
        client_id: 'c3',
        client_name: 'Jovana Lukić',
        client_phone: '064555666',
        service_name: 'Svilene trepavice',
        start_time: new Date(Date.now() - 86400000).toISOString(), // yesterday
        status: 'completed',
        silent_appointment: false,
        price_charged: 3000
      }
    ])

    setClients([
      {
        id: 'c1',
        full_name: 'Milica Petrović',
        phone: '065111222',
        email: 'milica@example.com',
        notes: 'Prethodni put radile crveni frenč, ima osetljive zanoktice.',
        total_bookings: 4,
        is_blacklisted: false
      },
      {
        id: 'c2',
        full_name: 'Ana Marić',
        phone: '066333444',
        email: 'ana@example.com',
        notes: 'Otkazala 2 puta u zadnji čas.',
        total_bookings: 1,
        is_blacklisted: true // Blacklisted!
      },
      {
        id: 'c3',
        full_name: 'Jovana Lukić',
        phone: '064555666',
        email: 'jovana@example.com',
        notes: 'Uvek tačna, preferira tihe termine.',
        total_bookings: 5,
        is_blacklisted: false
      }
    ])

    setBlacklistPhones(['066333444'])
    setWaitlistCount(2)
  }

  // Handle Authentication status check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadRealData(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        loadRealData(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch real data from Supabase
  const loadRealData = async (userId: string) => {
    try {
      // 1. Fetch salon
      const { data: salonData } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle()

      if (!salonData) {
        // Prompt for salon creation
        setSalon({ needsCreation: true })
        return
      }

      setSalon(salonData)

      // Apply theme color
      if (salonData.theme_color) {
        document.documentElement.style.setProperty('--primary', salonData.theme_color)
      }

      // 2. Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonData.id)

      setServices(servicesData || [])

      // 3. Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('salon_id', salonData.id)

      // 4. Fetch blacklist
      const { data: blacklistData } = await supabase
        .from('blacklist')
        .select('client_phone')
        .eq('salon_id', salonData.id)

      const blacklistedSet = new Set(blacklistData?.map(b => b.client_phone) || [])
      setBlacklistPhones(Array.from(blacklistedSet))

      const mappedClients = (clientsData || []).map(c => ({
        ...c,
        is_blacklisted: blacklistedSet.has(c.phone)
      }))

      setClients(mappedClients)

      // 5. Fetch appointments
      const { data: appData } = await supabase
        .from('appointments')
        .select(`
          id,
          client_id,
          start_time,
          status,
          silent_appointment,
          price_charged,
          clients (full_name, phone),
          services (name)
        `)
        .eq('salon_id', salonData.id)
        .order('start_time', { ascending: false })

      const mappedApps = (appData || []).map((a: any) => ({
        id: a.id,
        client_id: a.client_id,
        client_name: a.clients?.full_name || 'Neznato',
        client_phone: a.clients?.phone || '',
        service_name: a.services?.name || 'Neznata usluga',
        start_time: a.start_time,
        status: a.status,
        silent_appointment: a.silent_appointment,
        price_charged: Number(a.price_charged || 0)
      }))

      setAppointments(mappedApps)

      // 6. Fetch waitlist count
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonData.id)
        .eq('status', 'active')

      setWaitlistCount(count || 0)

    } catch (e) {
      console.error(e)
    }
  }

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert('Pogrešan email ili lozinka.')
    }
    setAuthLoading(false)
  }

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: 'Vlasnik Salona' } }
    })
    if (error) {
      alert('Greška pri registraciji: ' + error.message)
    } else {
      alert('Uspešno ste se registrovali! Potvrdite email link ako je potrebno, ili se prijavite.')
    }
    setAuthLoading(false)
  }

  // Create Salon handler for new accounts
  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    const name = (e.target as any).salonName.value
    const slug = (e.target as any).salonSlug.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    
    try {
      const { data, error } = await supabase.from('salons').insert({
        owner_id: session.user.id,
        name,
        slug,
        theme_color: '#ec4899',
      }).select().single()

      if (error) throw error
      setSalon(data)
      loadRealData(session.user.id)
    } catch (err: any) {
      alert('Greška pri kreiranju salona. Slug mora biti jedinstven: ' + err.message)
    }
  }

  // Handle Appointment Status Change
  const updateAppointmentStatus = async (appId: string, newStatus: 'confirmed' | 'completed' | 'cancelled' | 'no_show') => {
    if (demoMode) {
      // Mock update
      setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
      
      // If completed in mock mode, increment client booking count
      if (newStatus === 'completed') {
        const app = appointments.find(a => a.id === appId)
        if (app) {
          setClients(prev => prev.map(c => c.id === app.client_id ? { ...c, total_bookings: c.total_bookings + 1 } : c))
        }
      }
      
      // If no_show in mock mode, blacklist the phone
      if (newStatus === 'no_show') {
        const app = appointments.find(a => a.id === appId)
        if (app && !blacklistPhones.includes(app.client_phone)) {
          setBlacklistPhones(prev => [...prev, app.client_phone])
          setClients(prev => prev.map(c => c.phone === app.client_phone ? { ...c, is_blacklisted: true } : c))
        }
      }
      return
    }

    try {
      // 1. Update appointment status
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appId)

      if (error) throw error

      // 2. If 'no_show', add to blacklist
      if (newStatus === 'no_show') {
        const app = appointments.find(a => a.id === appId)
        if (app) {
          await supabase.from('blacklist').upsert({
            salon_id: salon.id,
            client_phone: app.client_phone,
            reason: 'Automatski dodato usled No-Show termina.'
          }, { onConflict: 'salon_id,client_phone' })
        }
      }

      loadRealData(session.user.id)
    } catch (e) {
      console.error(e)
    }
  }

  // Handle CRM notes update
  const saveCrmNotes = async () => {
    if (!selectedClient) return

    if (demoMode) {
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, notes: crmNotesText } : c))
      setSelectedClient(prev => prev ? { ...prev, notes: crmNotesText } : null)
      alert('Beleška sačuvana (Demo)!')
      return
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({ notes: crmNotesText })
        .eq('id', selectedClient.id)

      if (error) throw error
      setSelectedClient(prev => prev ? { ...prev, notes: crmNotesText } : null)
      loadRealData(session.user.id)
      alert('Beleška uspešno sačuvana!')
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Blacklist toggle in CRM
  const toggleBlacklistClient = async (client: Client) => {
    const isNowBlacklisted = !client.is_blacklisted

    if (demoMode) {
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, is_blacklisted: isNowBlacklisted } : c))
      if (isNowBlacklisted) {
        setBlacklistPhones(prev => [...prev, client.phone])
      } else {
        setBlacklistPhones(prev => prev.filter(p => p !== client.phone))
      }
      setSelectedClient(prev => prev ? { ...prev, is_blacklisted: isNowBlacklisted } : null)
      return
    }

    try {
      if (isNowBlacklisted) {
        await supabase.from('blacklist').insert({
          salon_id: salon.id,
          client_phone: client.phone,
          reason: 'Ručno flagovan na klijentskom CRM-u.'
        })
      } else {
        await supabase
          .from('blacklist')
          .delete()
          .eq('salon_id', salon.id)
          .eq('client_phone', client.phone)
      }
      
      setSelectedClient(prev => prev ? { ...prev, is_blacklisted: isNowBlacklisted } : null)
      loadRealData(session.user.id)
    } catch (e) {
      console.error(e)
    }
  }

  // Handle adding/updating service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon || !newServiceName || !newServicePrice) return

    const priceNum = Number(newServicePrice)
    const durationNum = Number(newServiceDuration)

    if (demoMode) {
      if (editingServiceId) {
        // Update existing in mock
        setServices(prev => prev.map(s => s.id === editingServiceId ? {
          ...s,
          name: newServiceName,
          price: priceNum,
          duration_minutes: durationNum,
          description: newServiceDesc
        } : s))
        alert('Usluga izmenjena (Demo)!')
      } else {
        // Add new to mock
        const newSrv: Service = {
          id: 'mock-s-' + Math.random().toString(36).substr(2, 9),
          name: newServiceName,
          price: priceNum,
          duration_minutes: durationNum,
          description: newServiceDesc,
          is_active: true
        }
        setServices(prev => [...prev, newSrv])
        alert('Usluga kreirana (Demo)!')
      }
      
      // Reset form
      setEditingServiceId(null)
      setNewServiceName('')
      setNewServicePrice('')
      setNewServiceDuration('30')
      setNewServiceDesc('')
      return
    }

    try {
      if (editingServiceId) {
        // Update DB
        const { error } = await supabase
          .from('services')
          .update({
            name: newServiceName,
            price: priceNum,
            duration_minutes: durationNum,
            description: newServiceDesc
          })
          .eq('id', editingServiceId)

        if (error) throw error
        alert('Usluga uspešno izmenjena!')
      } else {
        // Insert DB
        const { error } = await supabase
          .from('services')
          .insert({
            salon_id: salon.id,
            name: newServiceName,
            price: priceNum,
            duration_minutes: durationNum,
            description: newServiceDesc,
            is_active: true
          })

        if (error) throw error
        alert('Usluga uspešno kreirana!')
      }

      setEditingServiceId(null)
      setNewServiceName('')
      setNewServicePrice('')
      setNewServiceDuration('30')
      setNewServiceDesc('')
      loadRealData(session.user.id)
    } catch (err: any) {
      console.error(err)
      alert('Greška pri čuvanju usluge: ' + err.message)
    }
  }

  // Handle deleting service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu uslugu?')) return

    if (demoMode) {
      setServices(prev => prev.filter(s => s.id !== id))
      alert('Usluga obrisana (Demo)!')
      return
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Usluga uspešno obrisana!')
      loadRealData(session.user.id)
    } catch (err: any) {
      console.error(err)
      alert('Greška pri brisanju usluge: ' + err.message)
    }
  }
  // Draw Canvas Story
  useEffect(() => {
    if (activeTab !== 'story') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Base Dimensions for Instagram Story (1080 x 1920)
    canvas.width = 1080
    canvas.height = 1920

    // Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, storyBgPrimary)
    gradient.addColorStop(1, storyBgSecondary)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw Sleek Accent Circles / Glow effects
    ctx.fillStyle = storyThemeColor
    ctx.globalAlpha = 0.15
    ctx.beginPath()
    ctx.arc(canvas.width, 0, 400, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, canvas.height, 500, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1.0

    // Draw Title (Salon Name)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 50px Outfit'
    ctx.textAlign = 'center'
    ctx.fillText((salon?.name || 'MOJ SALON').toUpperCase(), canvas.width / 2, 250)

    // Draw Subtitle / Offer
    ctx.fillStyle = storyThemeColor
    ctx.font = '500 40px Plus Jakarta Sans'
    ctx.fillText('SLOBODNI TERMINI OVE NEDELJE', canvas.width / 2, 330)

    // Draw decorative border lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(150, 400)
    ctx.lineTo(canvas.width - 150, 400)
    ctx.stroke()

    // Draw Slots Text
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 48px Outfit'
    ctx.textAlign = 'center'
    
    const lines = storySlotsText.split('\n')
    let startY = 600
    
    lines.forEach((line) => {
      // If line contains a colon, split it to highlight the day!
      if (line.includes(':')) {
        const parts = line.split(':')
        const day = parts[0].trim()
        const times = parts[1].trim()

        ctx.fillStyle = storyThemeColor
        ctx.font = 'bold 52px Outfit'
        ctx.fillText(day.toUpperCase(), canvas.width / 2, startY)
        
        ctx.fillStyle = '#f4f4f5'
        ctx.font = '500 42px Plus Jakarta Sans'
        ctx.fillText(times, canvas.width / 2, startY + 70)
        startY += 190
      } else {
        ctx.fillStyle = '#f4f4f5'
        ctx.font = '500 45px Plus Jakarta Sans'
        ctx.fillText(line, canvas.width / 2, startY)
        startY += 110
      }
    })

    // Draw Call To Action box at bottom
    const boxX = 150
    const boxY = canvas.height - 350
    const boxW = canvas.width - 300
    const boxH = 180
    const cornerRadius = 30

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 3
    
    // Rounded rectangle
    ctx.beginPath()
    ctx.arc(boxX + cornerRadius, boxY + cornerRadius, cornerRadius, Math.PI, Math.PI * 1.5)
    ctx.arc(boxX + boxW - cornerRadius, boxY + cornerRadius, cornerRadius, Math.PI * 1.5, 0)
    ctx.arc(boxX + boxW - cornerRadius, boxY + boxH - cornerRadius, cornerRadius, 0, Math.PI * 0.5)
    ctx.arc(boxX + cornerRadius, boxY + boxH - cornerRadius, cornerRadius, Math.PI * 0.5, Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // CTA Text inside box
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 40px Plus Jakarta Sans'
    ctx.fillText('Klikni na link u biografiji za brzo zakazivanje', canvas.width / 2, boxY + 80)
    ctx.fillStyle = storyThemeColor
    ctx.font = 'bold 40px Outfit'
    ctx.fillText(`glowlink.com/${salon?.slug || 'salon'}`, canvas.width / 2, boxY + 135)

  }, [activeTab, storyBgPrimary, storyBgSecondary, storyThemeColor, storySlotsText, salon])

  // Download Story helper
  const downloadStory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `slobodni_termini_${salon?.slug || 'salon'}.png`
    link.href = url
    link.click()
  }

  // Dashboard Stats Calculations
  const completedApps = appointments.filter(a => a.status === 'completed')
  const monthlyEarnings = completedApps.reduce((acc, curr) => acc + curr.price_charged, 0)
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const totalClientStamps = clients.length

  // Authentication UI
  if (!session && !demoMode) {
    return (
      <div className="auth-overlay">
        <div className="glass-panel auth-card animate-slide-up">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="logo-brand" style={{ justifyContent: 'center', fontSize: '2rem' }}>✦ GlowLink</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
              Prijavite se da upravljate Vašim salonom
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email adresa</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="salon@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lozinka</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginBottom: '12px' }}
              disabled={authLoading}
            >
              {authLoading ? 'Prijavljivanje...' : 'Prijavi se'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '14px', marginBottom: '24px' }}
              onClick={handleSignup}
              disabled={authLoading}
            >
              Registruj se
            </button>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Želite samo da isprobate aplikaciju?
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px', background: 'rgba(236, 72, 153, 0.08)', borderColor: 'var(--primary)' }}
                onClick={() => {
                  setDemoMode(true)
                  loadMockData()
                }}
              >
                Vidi Demo mod (bez registracije)
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Create Salon UI for brand new authenticated accounts
  if (salon?.needsCreation) {
    return (
      <div className="auth-overlay">
        <div className="glass-panel auth-card animate-slide-up">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="logo-brand" style={{ justifyContent: 'center', fontSize: '1.75rem' }}>✦ GlowLink</span>
            <h3 style={{ marginTop: '12px' }}>Kreirajte Vaš Salon</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Podesite ime i unikatni link za Vaš Instagram bio
            </p>
          </div>

          <form onSubmit={handleCreateSalon}>
            <div className="form-group">
              <label className="form-label">Naziv Salona</label>
              <input
                type="text"
                name="salonName"
                className="form-input"
                required
                placeholder="Nails by Jelena"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unikatni link (slug)</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '4px' }}>glowlink.com/</span>
                <input
                  type="text"
                  name="salonSlug"
                  className="form-input"
                  required
                  style={{ flex: 1 }}
                  placeholder="jelena-nokti"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
              Kreiraj i uđi u Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="logo-brand">
          <span>✦</span> GlowLink
        </div>

        <ul className="nav-list">
          <li
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Mesečna statistika
          </li>
          <li
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            📅 Kalendar & Termini
            {pendingCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                {pendingCount}
              </span>
            )}
          </li>
          <li
            className={`nav-item ${activeTab === 'crm' ? 'active' : ''}`}
            onClick={() => setActiveTab('crm')}
          >
            👥 Mini CRM (Klijenti)
          </li>
          <li
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            💇‍♀️ Upravljanje Uslugama
          </li>
          <li
            className={`nav-item ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => setActiveTab('story')}
          >
            📱 Instagram Story
          </li>
          <li
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙ Podešavanja
          </li>
        </ul>

        {/* User Info footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Ulogovani ste kao:
          </p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {demoMode ? 'Demo Salon' : session?.user?.email}
          </p>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.8rem' }}
            onClick={() => {
              if (demoMode) {
                setDemoMode(false)
                setSalon(null)
              } else {
                supabase.auth.signOut()
              }
            }}
          >
            Odjavi se
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="main-content">
        {/* Top bar */}
        <div className="header-actions">
          <div>
            <h1>Dobrodošli nazad, {demoMode ? 'Jelena' : 'Vlasnik'}!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Vaš javni link za Instagram bio:{' '}
              <a
                href={`/${salon?.slug}`}
                target="_blank"
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                glowlink.com/{salon?.slug} ↗
              </a>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-success">Aktivna lista čekanja: {waitlistCount}</span>
            </div>
            {demoMode && (
              <span className="badge badge-warning" style={{ alignSelf: 'center' }}>
                DEMO MOD
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: STATISTICS */}
        {activeTab === 'stats' && (
          <div className="animate-fade-in">
            {/* Stats Row */}
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <div className="stat-header">
                  <span className="stat-title">Zarada ovog meseca</span>
                  <span className="stat-trend up">↑ 14%</span>
                </div>
                <div className="stat-value">{monthlyEarnings} RSD</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>u odnosu na prošli mesec</div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-header">
                  <span className="stat-title">Završeni Termini</span>
                  <span className="stat-trend up">↑ 8%</span>
                </div>
                <div className="stat-value">{completedApps.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>odrađenih poseta</div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-header">
                  <span className="stat-title">Ukupno Klijenata</span>
                  <span className="stat-trend up">↑ 5%</span>
                </div>
                <div className="stat-value">{totalClientStamps}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>registrovana u bazi</div>
              </div>
            </div>

            {/* Popular Services & Waitlist alert panels */}
            <div className="panel-grid">
              <div className="glass-panel panel-card">
                <h3>Popularnost Usluga</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Raspodela profita po uslugama
                </p>

                {/* Simulated Chart Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>Izlivanje noktiju</span>
                      <strong>65% profit</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '65%', height: '100%', background: 'var(--primary)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>Svilene trepavice</span>
                      <strong>20% profit</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '20%', height: '100%', background: 'var(--accent)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>Gel lak</span>
                      <strong>15% profit</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '15%', height: '100%', background: 'var(--accent-gold)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CRM Tips */}
              <div className="glass-panel panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--accent-gold)' }}>★ Loyalty Statistika</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.5' }}>
                    Ove nedelje je čak <strong>3 klijentkinje</strong> iskoristilo svoj besplatni 5. termin.
                    Automatski rođendanski popusti su doneli <strong>15% više</strong> poseta u odnosu na prosek!
                  </p>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('crm')}>
                    Vidi klijente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CALENDAR & SCHEDULER */}
        {activeTab === 'calendar' && (
          <div className="glass-panel panel-card animate-fade-in">
            <div className="panel-header">
              <h3>Pregled Zakazanih Termina</h3>
              <span className="badge badge-warning">Ažurira se u realnom vremenu</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Vreme</th>
                  <th>Klijent</th>
                  <th>Usluga</th>
                  <th>Tihi termin?</th>
                  <th>Cena</th>
                  <th>Status</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  const dateObj = new Date(app.start_time)
                  const timeFormatted = dateObj.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
                  const dateFormatted = dateObj.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })
                  
                  return (
                    <tr key={app.id}>
                      <td>
                        <strong>{timeFormatted}h</strong> <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateFormatted}</span>
                      </td>
                      <td>
                        <strong>{app.client_name}</strong> <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.client_phone}</span>
                      </td>
                      <td>{app.service_name}</td>
                      <td>{app.silent_appointment ? '🤫 Tihi termin' : '💬 Standardno'}</td>
                      <td>{app.price_charged} RSD</td>
                      <td>
                        <span className={`badge ${
                          app.status === 'completed' ? 'badge-success' :
                          app.status === 'confirmed' ? 'badge-info' :
                          app.status === 'pending' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {app.status === 'completed' ? 'Završen' :
                           app.status === 'confirmed' ? 'Potvrđen' :
                           app.status === 'pending' ? 'Čeka odobrenje' :
                           app.status === 'no_show' ? 'No-Show' : 'Otkazan'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {app.status === 'pending' && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                              onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                            >
                              Odobri
                            </button>
                          )}
                          {app.status === 'confirmed' && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'var(--success)' }}
                              onClick={() => updateAppointmentStatus(app.id, 'completed')}
                            >
                              Završi
                            </button>
                          )}
                          {app.status !== 'completed' && app.status !== 'cancelled' && app.status !== 'no_show' && (
                            <>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                                onClick={() => updateAppointmentStatus(app.id, 'no_show')}
                              >
                                No-Show
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                              >
                                Otkaži
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nema zakazanih termina.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: MINI CRM (CLIENTS) */}
        {activeTab === 'crm' && (
          <div className="panel-grid animate-fade-in">
            {/* Client List */}
            <div className="glass-panel panel-card">
              <h3>Klijenti & CRM Kartoni</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Izaberite klijentkinju da vidite karton i beleške
              </p>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ime i prezime</th>
                    <th>Telefon</th>
                    <th>Posete</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSelectedClient(c)
                        setCrmNotesText(c.notes || '')
                      }}
                      style={{ cursor: 'pointer', background: selectedClient?.id === c.id ? 'rgba(255,255,255,0.03)' : '' }}
                    >
                      <td>
                        <strong>{c.full_name}</strong>
                      </td>
                      <td>{c.phone}</td>
                      <td>{c.total_bookings} dolazaka</td>
                      <td>
                        {c.is_blacklisted ? (
                          <span className="badge badge-danger">Nepouzdan (Crna lista)</span>
                        ) : (
                          <span className="badge badge-success">Pouzdana</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CRM Detail Sheet */}
            <div className="glass-panel panel-card">
              {selectedClient ? (
                <div className="client-detail-card">
                  <div className="client-header">
                    <div className="client-avatar">
                      {selectedClient.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="client-info">
                      <h3>{selectedClient.full_name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedClient.phone}</span>
                    </div>
                  </div>

                  <hr style={{ borderColor: 'var(--border-color)' }} />

                  {/* Blacklist block indicator */}
                  {selectedClient.is_blacklisted && (
                    <div className="alert-box alert-danger">
                      ⚠️ <strong>Crna Lista aktivirana!</strong> Sledeća rezervacija sa ovog telefona će zahtevati Vaše ručno odobrenje pre nego što bude potvrđena.
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Interna Beleška za Klijenta (CRM)</label>
                    <textarea
                      className="client-notes-textarea"
                      placeholder="Npr. radile crveni frenč, ima osetljive zanoktice, ne voli previše small talk..."
                      value={crmNotesText}
                      onChange={(e) => setCrmNotesText(e.target.value)}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={saveCrmNotes}>
                    Sačuvaj belešku
                  </button>

                  <button
                    className={`btn ${selectedClient.is_blacklisted ? 'btn-secondary' : 'btn-secondary'}`}
                    style={{ borderColor: selectedClient.is_blacklisted ? 'var(--success)' : 'var(--danger)', color: selectedClient.is_blacklisted ? 'var(--success)' : 'var(--danger)' }}
                    onClick={() => toggleBlacklistClient(selectedClient)}
                  >
                    {selectedClient.is_blacklisted ? '✓ Skloni sa Crne Liste' : '⚠️ Stavi na Crnu Listu'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '2.5rem' }}>👥</span>
                  <p style={{ marginTop: '12px' }}>Izaberite klijentkinju iz tabele za CRM karton</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: INSTAGRAM STORY GENERATOR */}
        {activeTab === 'story' && (
          <div className="glass-panel panel-card animate-fade-in">
            <div className="panel-header">
              <h3>Instagram Story Generator slobodnih termina</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Kreirajte prelepu sliku slobodnih termina za Vaš Story u par klikova!
              </p>
            </div>

            <div className="story-creator-grid">
              {/* Canvas Preview */}
              <div className="canvas-preview-container">
                <canvas ref={canvasRef} className="story-canvas" />
                <button className="btn btn-primary" onClick={downloadStory} style={{ width: '320px' }}>
                  ⬇ Preuzmi sliku za Story
                </button>
              </div>

              {/* Controls */}
              <div className="creator-controls">
                <div className="form-group">
                  <label className="form-label">Slobodni termini (Tekst)</label>
                  <textarea
                    className="client-notes-textarea"
                    style={{ minHeight: '150px', fontFamily: 'monospace' }}
                    value={storySlotsText}
                    onChange={(e) => setStorySlotsText(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Formatirajte kao: DAN: vreme, vreme... za poseban stil!
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Izaberite pozadinske boje (Gradient)</label>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Boja 1</span>
                      <input
                        type="color"
                        style={{ display: 'block', marginTop: '4px', cursor: 'pointer' }}
                        value={storyBgPrimary}
                        onChange={(e) => setStoryBgPrimary(e.target.value)}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Boja 2</span>
                      <input
                        type="color"
                        style={{ display: 'block', marginTop: '4px', cursor: 'pointer' }}
                        value={storyBgSecondary}
                        onChange={(e) => setStoryBgSecondary(e.target.value)}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Akcenat</span>
                      <input
                        type="color"
                        style={{ display: 'block', marginTop: '4px', cursor: 'pointer' }}
                        value={storyThemeColor}
                        onChange={(e) => setStoryThemeColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <h4 style={{ color: 'var(--primary)' }}>💡 Savet za Instagram:</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                    Kada okačite ovaj Story, dodajte Instagram "Link" nalepnicu (Sticker) i unesite Vaš unikatni link:{' '}
                    <strong>glowlink.com/{salon?.slug}</strong>. Klijentkinje mogu odmah kliknuti i rezervisati prazan termin!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="panel-grid animate-fade-in">
            {/* Services List */}
            <div className="glass-panel panel-card">
              <div className="panel-header">
                <h3>Lista Usluga</h3>
                <button
                  className="btn btn-primary"
                  type="button"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setEditingServiceId(null)
                    setNewServiceName('')
                    setNewServicePrice('')
                    setNewServiceDuration('30')
                    setNewServiceDesc('')
                  }}
                >
                  + Nova usluga
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Naziv usluge</th>
                    <th>Trajanje</th>
                    <th>Cena</th>
                    <th>Status</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((srv) => (
                    <tr key={srv.id}>
                      <td>
                        <strong>{srv.name}</strong> <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {srv.description || 'Nema opisa.'}
                        </span>
                      </td>
                      <td>{srv.duration_minutes || 30} min</td>
                      <td><strong>{srv.price} RSD</strong></td>
                      <td>
                        <span className={`badge ${srv.is_active !== false ? 'badge-success' : 'badge-danger'}`}>
                          {srv.is_active !== false ? 'Aktivna' : 'Neaktivna'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary"
                            type="button"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setEditingServiceId(srv.id)
                              setNewServiceName(srv.name)
                              setNewServicePrice(srv.price.toString())
                              setNewServiceDuration((srv.duration_minutes || 30).toString())
                              setNewServiceDesc(srv.description || '')
                            }}
                          >
                            Izmeni
                          </button>
                          <button
                            className="btn btn-secondary"
                            type="button"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                            onClick={() => handleDeleteService(srv.id)}
                          >
                            Briši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nema definisanih usluga.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Service Form */}
            <div className="glass-panel panel-card">
              <h3>{editingServiceId ? 'Uredi Uslugu' : 'Dodaj Novu Uslugu'}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {editingServiceId ? 'Izmenite podatke o izabranoj usluzi' : 'Kreirajte novu uslugu u Vašem cenovniku'}
              </p>

              <form onSubmit={handleSaveService}>
                <div className="form-group">
                  <label className="form-label">Naziv Usluge</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Npr. Gel lak sa dizajnom"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cena (RSD)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    placeholder="1500"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Trajanje (Minuti)</label>
                  <select
                    className="form-input"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                  >
                    <option value="15">15 minuta</option>
                    <option value="30">30 minuta</option>
                    <option value="45">45 minuta</option>
                    <option value="60">1 sat (60 min)</option>
                    <option value="75">1 sat 15 min</option>
                    <option value="90">1.5 sat (90 min)</option>
                    <option value="120">2 sata (120 min)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Opis (opciono)</label>
                  <textarea
                    className="client-notes-textarea"
                    placeholder="Npr. ojačavanje, ukrašavanje cirkonima..."
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingServiceId ? 'Sačuvaj izmene' : 'Kreiraj uslugu'}
                  </button>
                  {editingServiceId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingServiceId(null)
                        setNewServiceName('')
                        setNewServicePrice('')
                        setNewServiceDuration('30')
                        setNewServiceDesc('')
                      }}
                    >
                      Otkaži
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-panel panel-card animate-fade-in" style={{ maxWidth: '600px' }}>
            <h3>Podešavanja Salona</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Uredite informacije koje klijenti vide na Vašoj stranici
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Podešavanja sačuvana!'); }}>
              <div className="form-group">
                <label className="form-label">Naziv Salona</label>
                <input
                  type="text"
                  className="form-input"
                  value={salon?.name || ''}
                  onChange={(e) => setSalon({ ...salon, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unikatni link (slug)</label>
                <input
                  type="text"
                  className="form-input"
                  value={salon?.slug || ''}
                  disabled
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Link je fiksiran. Kontaktirajte podršku za izmenu.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Opis Salona</label>
                <textarea
                  className="client-notes-textarea"
                  style={{ minHeight: '80px' }}
                  value={salon?.description || ''}
                  onChange={(e) => setSalon({ ...salon, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primarna boja teme salona</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                    value={salon?.theme_color || '#ec4899'}
                    onChange={(e) => {
                      const newColor = e.target.value
                      setSalon({ ...salon, theme_color: newColor })
                      document.documentElement.style.setProperty('--primary', newColor)
                    }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{salon?.theme_color || '#ec4899'}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Sačuvaj podešavanja
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
