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

  // Calendar states
  const [calendarViewMode, setCalendarViewMode] = useState<'list' | 'weekly'>('weekly')
  const [selectedAppDetails, setSelectedAppDetails] = useState<Appointment | null>(null)
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Block time modal states
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockDate, setBlockDate] = useState('')
  const [blockTime, setBlockTime] = useState('12:00')
  const [blockDuration, setBlockDuration] = useState('60')
  const [blockReason, setBlockReason] = useState('')

  // Manual booking modal states
  const [showManualBookModal, setShowManualBookModal] = useState(false)
  const [mbIsNewClient, setMbIsNewClient] = useState(true)
  const [mbSelectedClientId, setMbSelectedClientId] = useState('')
  const [mbClientName, setMbClientName] = useState('')
  const [mbClientPhone, setMbClientPhone] = useState('')
  const [mbClientEmail, setMbClientEmail] = useState('')
  const [mbSelectedServiceId, setMbSelectedServiceId] = useState('')
  const [mbDate, setMbDate] = useState('')
  const [mbTime, setMbTime] = useState('10:00')
  const [mbSilent, setMbSilent] = useState(false)
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

  // Handle saving salon settings (name, description, theme color, working hours)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon) return
    setSettingsSaving(true)

    if (demoMode) {
      alert('Podešavanja sačuvana u Demo modu!')
      setSettingsSaving(false)
      return
    }

    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: salon.name,
          description: salon.description,
          theme_color: salon.theme_color,
          working_hours: salon.working_hours,
        })
        .eq('id', salon.id)

      if (error) throw error
      alert('Podešavanja su uspešno sačuvana!');
      loadRealData(session.user.id)
    } catch (err: any) {
      console.error(err)
      alert('Greška pri čuvanju podešavanja: ' + err.message)
    } finally {
      setSettingsSaving(false)
    }
  }

  // Generate next 7 days starting from today for dashboard weekly view
  const getNext7Days = () => {
    const arr = []
    const today = new Date()
    const locale = 'sr-RS'
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      const dayName = d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
      arr.push({ dayName, dateStr, label, isToday: i === 0 })
    }
    return arr
  }

  // Calculate dynamic stats from appointments data
  const getDynamicStats = () => {
    if (appointments.length === 0) {
      return {
        popularServices: [],
        silentPercentage: 0,
        standardPercentage: 0,
        mostPopularDay: 'Nema podataka',
        totalConfirmedOrCompleted: 0,
        totalEarnings: 0
      }
    }

    let totalConfirmedOrCompleted = 0
    let silentCount = 0
    let totalEarnings = 0
    const serviceCounts: Record<string, number> = {}
    const dayNames = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota']
    const dayCounts: Record<string, number> = {}
    dayNames.forEach(d => { dayCounts[d] = 0 })

    appointments.forEach(app => {
      if (app.status === 'confirmed' || app.status === 'completed') {
        totalConfirmedOrCompleted++
        
        const sName = app.service_name || 'Neznata usluga'
        serviceCounts[sName] = (serviceCounts[sName] || 0) + 1
        
        if (app.silent_appointment) {
          silentCount++
        }

        totalEarnings += app.price_charged || 0

        const dateObj = new Date(app.start_time)
        const dayName = dayNames[dateObj.getDay()]
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1
      }
    })

    const popularServices = Object.entries(serviceCounts)
      .map(([name, count]) => {
        const percentage = totalConfirmedOrCompleted > 0 ? Math.round((count / totalConfirmedOrCompleted) * 100) : 0
        return { name, count, percentage }
      })
      .sort((a, b) => b.count - a.count)

    const silentPercentage = totalConfirmedOrCompleted > 0 ? Math.round((silentCount / totalConfirmedOrCompleted) * 100) : 0
    const standardPercentage = 100 - silentPercentage

    let mostPopularDay = 'Nema podataka'
    let maxDayCount = 0
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count
        mostPopularDay = day
      }
    })

    return {
      popularServices,
      silentPercentage,
      standardPercentage,
      mostPopularDay,
      totalConfirmedOrCompleted,
      totalEarnings
    }
  }

  // Handle blocking a specific time range in the calendar
  const handleBlockTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon) return
    if (services.length === 0 && !demoMode) {
      alert('Morate imati bar jednu kreiranu uslugu u cenovniku da biste blokirali vreme.')
      return
    }

    const serviceId = services[0]?.id || 'demo-service-id'
    const startTime = new Date(`${blockDate}T${blockTime}:00`)
    const endTime = new Date(startTime.getTime() + Number(blockDuration) * 60000)
    const blockLabel = blockReason ? `Blokirano: ${blockReason}` : 'Blokirano vreme'

    try {
      if (demoMode) {
        const newApp: Appointment = {
          id: 'mock-block-' + Date.now(),
          client_id: 'mock-block-client',
          client_name: blockLabel,
          client_phone: '000000',
          service_name: 'Blokirano vreme',
          start_time: startTime.toISOString(),
          price_charged: 0,
          silent_appointment: false,
          status: 'confirmed'
        }
        setAppointments(prev => [newApp, ...prev])
        alert('Vreme uspešno blokirano (Demo mod)!')
        setShowBlockModal(false)
        setBlockReason('')
        return
      }

      // Create a unique client for this block so we can store the reason in full_name
      const { data: blockClient, error: clientErr } = await supabase
        .from('clients')
        .insert({
          salon_id: salon.id,
          full_name: blockLabel,
          phone: '000000-' + Date.now(), // Unique phone to avoid unique key constraints
          notes: 'Služi za blokiranje kalendara.'
        })
        .select()
        .single()

      if (clientErr) throw clientErr

      // Insert blocked appointment
      const { error: appErr } = await supabase.from('appointments').insert({
        salon_id: salon.id,
        service_id: serviceId,
        client_id: blockClient.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed',
        price_charged: 0,
        silent_appointment: false
      })

      if (appErr) throw appErr

      alert('Vreme je uspešno blokirano u kalendaru!')
      setShowBlockModal(false)
      setBlockReason('')
      loadRealData(session.user.id)
    } catch (err: any) {
      console.error(err)
      alert('Greška pri blokiranju: ' + err.message)
    }
  }

  // Handle manual booking submission from owner
  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon || !mbSelectedServiceId || !mbDate || !mbTime) {
      alert('Molimo popunite sva obavezna polja.')
      return
    }

    const selectedServiceObj = services.find(s => s.id === mbSelectedServiceId)
    if (!selectedServiceObj) return

    const startTime = new Date(`${mbDate}T${mbTime}:00`)
    const endTime = new Date(startTime.getTime() + (selectedServiceObj.duration_minutes || 30) * 60000)

    try {
      let finalClientId = ''
      let finalClientName = ''
      let finalClientPhone = ''

      if (demoMode) {
        if (mbIsNewClient) {
          finalClientId = 'mock-client-' + Date.now()
          finalClientName = mbClientName
          finalClientPhone = mbClientPhone
          const newClientObj: Client = {
            id: finalClientId,
            full_name: mbClientName,
            phone: mbClientPhone,
            email: mbClientEmail || '',
            notes: '',
            total_bookings: 1,
            is_blacklisted: false
          }
          setClients(prev => [...prev, newClientObj])
        } else {
          const existingClient = clients.find(c => c.id === mbSelectedClientId)
          if (!existingClient) return
          finalClientId = existingClient.id
          finalClientName = existingClient.full_name
          finalClientPhone = existingClient.phone
          setClients(prev => prev.map(c => c.id === finalClientId ? { ...c, total_bookings: c.total_bookings + 1 } : c))
        }

        const newApp: Appointment = {
          id: 'mock-app-' + Date.now(),
          client_id: finalClientId,
          client_name: finalClientName,
          client_phone: finalClientPhone,
          service_name: selectedServiceObj.name,
          start_time: startTime.toISOString(),
          price_charged: selectedServiceObj.price,
          silent_appointment: mbSilent,
          status: 'confirmed'
        }

        setAppointments(prev => [newApp, ...prev])
        alert('Termin uspešno zakazan ručno (Demo mod)!')
        setShowManualBookModal(false)
        resetManualBookingForm()
        return
      }

      // Live mode with Supabase
      if (mbIsNewClient) {
        const { data: newClient, error: clientErr } = await supabase
          .from('clients')
          .upsert(
            {
              salon_id: salon.id,
              full_name: mbClientName,
              phone: mbClientPhone.trim(),
              email: mbClientEmail || null,
            },
            { onConflict: 'salon_id,phone' }
          )
          .select()
          .single()

        if (clientErr) throw clientErr
        finalClientId = newClient.id
      } else {
        finalClientId = mbSelectedClientId
      }

      // Insert confirmed appointment
      const { error: appErr } = await supabase.from('appointments').insert({
        salon_id: salon.id,
        service_id: mbSelectedServiceId,
        client_id: finalClientId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed',
        price_charged: selectedServiceObj.price,
        silent_appointment: mbSilent
      })

      if (appErr) throw appErr

      alert('Termin je uspešno zakazan ručno!')
      setShowManualBookModal(false)
      resetManualBookingForm()
      loadRealData(session.user.id)
    } catch (err: any) {
      console.error(err)
      alert('Greška pri ručnom zakazivanju: ' + err.message)
    }
  }

  const resetManualBookingForm = () => {
    setMbClientName('')
    setMbClientPhone('')
    setMbClientEmail('')
    setMbSelectedClientId('')
    setMbSelectedServiceId('')
    setMbSilent(false)
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

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, storyBgPrimary)
    gradient.addColorStop(1, storyBgSecondary)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. Draw Sleek Ambient Glow Circles (Glassmorphic ambient background)
    // Top-Right Radial Glow
    const glow1 = ctx.createRadialGradient(canvas.width, 0, 50, canvas.width, 0, 600)
    glow1.addColorStop(0, storyThemeColor)
    glow1.addColorStop(1, 'transparent')
    ctx.fillStyle = glow1
    ctx.globalAlpha = 0.35
    ctx.beginPath()
    ctx.arc(canvas.width, 0, 600, 0, Math.PI * 2)
    ctx.fill()

    // Bottom-Left Radial Glow
    const glow2 = ctx.createRadialGradient(0, canvas.height, 50, 0, canvas.height, 700)
    glow2.addColorStop(0, storyThemeColor)
    glow2.addColorStop(1, 'transparent')
    ctx.fillStyle = glow2
    ctx.globalAlpha = 0.25
    ctx.beginPath()
    ctx.arc(0, canvas.height, 700, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1.0

    // 3. Draw Title (Salon Name)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 54px Outfit, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText((salon?.name || 'MOJ SALON').toUpperCase(), canvas.width / 2, 230)

    // Sparkle decoration next to title
    ctx.fillStyle = storyThemeColor
    ctx.font = '40px Outfit, sans-serif'
    const titleWidth = ctx.measureText((salon?.name || 'MOJ SALON').toUpperCase()).width
    ctx.fillText('✦', canvas.width / 2 - (titleWidth / 2) - 40, 220)
    ctx.fillText('✦', canvas.width / 2 + (titleWidth / 2) + 40, 220)

    // Draw Subtitle / Offer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.font = 'bold 36px Plus Jakarta Sans, sans-serif'
    ctx.fillText('SLOBODNI TERMINI OVE NEDELJE', canvas.width / 2, 310)

    // Draw decorative divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(150, 370)
    ctx.lineTo(canvas.width - 150, 370)
    ctx.stroke()

    // Helper function to draw rounded rectangle cards
    const drawCard = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      
      // Card glassmorphic fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fill()
      
      // Card border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // 4. Draw Slots Text inside Glassmorphic Card Containers
    const lines = storySlotsText.split('\n')
    let startY = 440
    const cardW = 840
    const cardH = 140
    const cardX = (canvas.width - cardW) / 2

    lines.forEach((line) => {
      if (!line.trim()) return

      const colonIndex = line.indexOf(':')
      if (colonIndex !== -1) {
        const day = line.substring(0, colonIndex).trim().toUpperCase()
        const times = line.substring(colonIndex + 1).trim()

        // Draw card wrapper
        drawCard(cardX, startY, cardW, cardH, 24)

        // Draw Day Name (Left-aligned)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 44px Outfit, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(day, cardX + 40, startY + 82)

        // Draw Times List (Right-aligned)
        ctx.fillStyle = storyThemeColor
        ctx.font = '600 38px Plus Jakarta Sans, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(times, cardX + cardW - 40, startY + 80)

        startY += cardH + 24
      } else {
        // Fallback for custom announcements
        drawCard(cardX, startY, cardW, 100, 20)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '500 36px Plus Jakarta Sans, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(line, canvas.width / 2, startY + 62)
        
        startY += 100 + 20
      }
    })

    // 5. Draw Call To Action box styled like a real Instagram Link Sticker
    const stickerW = 680
    const stickerH = 100
    const stickerX = (canvas.width - stickerW) / 2
    const stickerY = canvas.height - 280
    const stickerR = 50

    // Draw pill shape
    ctx.beginPath()
    ctx.moveTo(stickerX + stickerR, stickerY)
    ctx.lineTo(stickerX + stickerW - stickerR, stickerY)
    ctx.quadraticCurveTo(stickerX + stickerW, stickerY, stickerX + stickerW, stickerY + stickerR)
    ctx.lineTo(stickerX + stickerW, stickerY + stickerH - stickerR)
    ctx.quadraticCurveTo(stickerX + stickerW, stickerY + stickerH, stickerX + stickerW - stickerR, stickerY + stickerH)
    ctx.lineTo(stickerX + stickerR, stickerY + stickerH)
    ctx.quadraticCurveTo(stickerX, stickerY + stickerH, stickerX, stickerY + stickerH - stickerR)
    ctx.lineTo(stickerX, stickerY + stickerR)
    ctx.quadraticCurveTo(stickerX, stickerY, stickerX + stickerR, stickerY)
    ctx.closePath()

    // Add shadow behind sticker to look realistic
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 6

    ctx.fillStyle = '#ffffff'
    ctx.fill()

    // Draw Link text inside sticker
    ctx.shadowColor = 'transparent' // Reset shadow
    ctx.fillStyle = storyThemeColor
    ctx.font = 'bold 36px Plus Jakarta Sans, sans-serif'
    ctx.textAlign = 'center'
    
    // Render text with link emoji
    ctx.fillText(`🔗 glowlink.com/${salon?.slug || 'salon'}`, canvas.width / 2, stickerY + 62)

    // Tap sticker sub-instruction
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '500 30px Plus Jakarta Sans, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Tapnite stiker za zakazivanje', canvas.width / 2, stickerY + stickerH + 60)

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
            {(() => {
              const stats = getDynamicStats()
              
              return (
                <>
                  {/* Stats Row */}
                  <div className="stats-grid">
                    <div className="glass-panel stat-card">
                      <div className="stat-header">
                        <span className="stat-title">Ukupan prihod (potvrđeno)</span>
                        <span className="stat-trend up" style={{ color: 'var(--accent-gold)' }}>★ Premium</span>
                      </div>
                      <div className="stat-value">{(stats.totalEarnings || monthlyEarnings).toLocaleString('sr-RS')} RSD</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ukupan prihod od odrađenih poseta</div>
                    </div>

                    <div className="glass-panel stat-card">
                      <div className="stat-header">
                        <span className="stat-title">Aktivni Termini</span>
                        <span className="stat-trend up">↑ 100%</span>
                      </div>
                      <div className="stat-value">{stats.totalConfirmedOrCompleted}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>potvrđenih ili završenih poseta</div>
                    </div>

                    <div className="glass-panel stat-card">
                      <div className="stat-header">
                        <span className="stat-title">Ukupno Klijenata</span>
                        <span className="stat-trend up">↑ 5%</span>
                      </div>
                      <div className="stat-value">{clients.length}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>klijentkinja u bazi podataka</div>
                    </div>
                  </div>

                  {/* Popular Services & Customer Habits */}
                  <div className="panel-grid">
                    <div className="glass-panel panel-card">
                      <h3>Popularnost Usluga</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                        Udeo različitih usluga u ukupnom broju zakazivanja
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {stats.popularServices.map((srv) => (
                          <div key={srv.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '600' }}>{srv.name}</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                <strong>{srv.count}</strong> {srv.count === 1 ? 'termin' : 'termina'} ({srv.percentage}%)
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${srv.percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                            </div>
                          </div>
                        ))}
                        {stats.popularServices.length === 0 && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                            Još uvek nema rezervacija za kreiranje statistike.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Preferences & Busy Days */}
                    <div className="glass-panel panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h3>Navike Klijentkinja</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                          Analiza preferencija i ponašanja posetilaca
                        </p>

                        {/* Silent Appointment preference */}
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                            <span>Standardno ćaskanje vs Tihi termin 🤫</span>
                          </div>
                          <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
                            <div
                              style={{ width: `${stats.standardPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
                              title={`Standardno: ${stats.standardPercentage}%`}
                            />
                            <div
                              style={{ width: `${stats.silentPercentage}%`, height: '100%', background: 'rgba(255,255,255,0.15)' }}
                              title={`Tihi termin: ${stats.silentPercentage}%`}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                            <span>Standardno: {stats.standardPercentage}%</span>
                            <span>Tihi termin 🤫: {stats.silentPercentage}%</span>
                          </div>
                        </div>

                        {/* Most Popular Day info */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px', marginTop: '16px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            🔥 Najtraženiji Dan U Nedelji
                          </span>
                          <h4 style={{ fontSize: '1.2rem', marginTop: '4px', marginBottom: '4px', color: 'var(--primary)' }}>
                            {stats.mostPopularDay}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                            {stats.mostPopularDay !== 'Nema podataka' 
                              ? `Tog dana klijentkinje najviše rezervišu termine. Razmislite o dodavanju dodatnih termina ili kraćih pauza kako biste maksimizovali prihod!` 
                              : 'Podaci o danima će se učitati sa prvim zakazanim terminima.'}
                          </p>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                        <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('crm')}>
                          👥 Idi na Mini CRM klijente
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* TAB 2: CALENDAR & SCHEDULER */}
        {activeTab === 'calendar' && (
          <div className="glass-panel panel-card animate-fade-in" style={{ padding: '24px' }}>
            <div className="panel-header" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Kalendar i Raspored</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', marginBottom: 0 }}>
                  Upravljajte rezervisanim terminima salona
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    setMbDate(today)
                    if (services.length > 0) {
                      setMbSelectedServiceId(services[0].id)
                    }
                    setShowManualBookModal(true)
                  }}
                >
                  ➕ Brzo zakazivanje
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    setBlockDate(today)
                    setShowBlockModal(true)
                  }}
                >
                  🔒 Blokiraj vreme
                </button>
                <button
                  type="button"
                  className={`btn ${calendarViewMode === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  onClick={() => setCalendarViewMode('weekly')}
                >
                  📅 Nedeljni prikaz
                </button>
                <button
                  type="button"
                  className={`btn ${calendarViewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  onClick={() => setCalendarViewMode('list')}
                >
                  📋 Lista termina
                </button>
              </div>
            </div>

            {/* List View */}
            {calendarViewMode === 'list' && (
              <div style={{ overflowX: 'auto' }}>
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
                                  type="button"
                                  className="btn btn-primary"
                                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                  onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                                >
                                  Odobri
                                </button>
                              )}
                              {app.status === 'confirmed' && (
                                <button
                                  type="button"
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
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                                    onClick={() => updateAppointmentStatus(app.id, 'no_show')}
                                  >
                                    No-Show
                                  </button>
                                  <button
                                    type="button"
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

            {/* Weekly Graphical Planner Grid */}
            {calendarViewMode === 'weekly' && (
              <div className="weekly-calendar-grid">
                {(() => {
                  const daysList = getNext7Days()
                  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

                  return daysList.map((d) => {
                    // Check working status for day
                    const dateObj = new Date(d.dateStr)
                    const dayKey = DAY_KEYS[dateObj.getDay()]
                    const workingInfo = salon?.working_hours?.[dayKey]
                    const isWorking = workingInfo?.is_working ?? true

                    // Filter appointments for this dateStr
                    const dayApps = appointments.filter(app => {
                      const appDate = new Date(app.start_time).toISOString().split('T')[0]
                      return appDate === d.dateStr
                    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

                    return (
                      <div key={d.dateStr} className={`calendar-day-column ${d.isToday ? 'today' : ''}`}>
                        <div className="calendar-day-header">
                          <span className="calendar-day-name">{d.dayName}</span>
                          <div className="calendar-day-date" style={{ color: d.isToday ? 'var(--primary)' : 'inherit' }}>
                            {d.label}
                          </div>
                        </div>

                        {!isWorking ? (
                          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Neradni dan 😴
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            {dayApps.map(app => {
                              const timeStr = new Date(app.start_time).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
                              const isBlocked = app.client_name.startsWith('Blokirano:') || app.client_name === 'Blokirano Vreme'
                              
                              if (isBlocked) {
                                const reason = app.client_name.replace('Blokirano:', '').trim() || 'Lične obaveze'
                                return (
                                  <div
                                    key={app.id}
                                    className="calendar-appt-card blocked"
                                    onClick={() => setSelectedAppDetails(app)}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                      <span>{timeStr}h</span>
                                      <span>🔒</span>
                                    </div>
                                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '600' }}>
                                      Blokirano
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                      {reason}
                                    </div>
                                  </div>
                                )
                              }

                              return (
                                <div
                                  key={app.id}
                                  className={`calendar-appt-card ${app.status}`}
                                  onClick={() => setSelectedAppDetails(app)}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>{timeStr}h</span>
                                    <span style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                                      {app.status === 'pending' ? '⏳' : app.status === 'confirmed' ? '✓' : '🏁'}
                                    </span>
                                  </div>
                                  <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '600' }}>
                                    {app.client_name}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {app.service_name}
                                  </div>
                                </div>
                              )
                            })}
                            {dayApps.length === 0 && (
                              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                Slobodno 🌸
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENT DETAILS OVERLAY MODAL */}
        {selectedAppDetails && (
          <div className="auth-overlay" onClick={() => setSelectedAppDetails(null)}>
            <div className="glass-panel auth-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Detalji Rezervacije</h3>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: 'auto' }}
                  onClick={() => setSelectedAppDetails(null)}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Klijent:</span>
                  <strong>{selectedAppDetails.client_name}</strong>

                  <span style={{ color: 'var(--text-muted)' }}>Telefon:</span>
                  <a href={`tel:${selectedAppDetails.client_phone}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    {selectedAppDetails.client_phone}
                  </a>

                  <span style={{ color: 'var(--text-muted)' }}>Datum:</span>
                  <span>{new Date(selectedAppDetails.start_time).toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>

                  <span style={{ color: 'var(--text-muted)' }}>Vreme:</span>
                  <strong>{new Date(selectedAppDetails.start_time).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}h</strong>

                  <span style={{ color: 'var(--text-muted)' }}>Usluga:</span>
                  <strong>{selectedAppDetails.service_name}</strong>

                  <span style={{ color: 'var(--text-muted)' }}>Cena:</span>
                  <strong>{selectedAppDetails.price_charged} RSD</strong>

                  <span style={{ color: 'var(--text-muted)' }}>Režim rada:</span>
                  <span>{selectedAppDetails.silent_appointment ? '🤫 Tihi termin (bez ćaskanja)' : '💬 Standardni termin'}</span>

                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span className={`badge ${
                    selectedAppDetails.status === 'completed' ? 'badge-success' :
                    selectedAppDetails.status === 'confirmed' ? 'badge-info' :
                    selectedAppDetails.status === 'pending' ? 'badge-warning' :
                    'badge-danger'
                  }`} style={{ justifySelf: 'start' }}>
                    {selectedAppDetails.status === 'completed' ? 'Završen' :
                     selectedAppDetails.status === 'confirmed' ? 'Potvrđen' :
                     selectedAppDetails.status === 'pending' ? 'Čeka odobrenje' :
                     selectedAppDetails.status === 'no_show' ? 'No-Show' : 'Otkazan'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                {selectedAppDetails.status === 'pending' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    onClick={() => {
                      updateAppointmentStatus(selectedAppDetails.id, 'confirmed')
                      setSelectedAppDetails(null)
                    }}
                  >
                    Odobri termin
                  </button>
                )}
                {selectedAppDetails.status === 'confirmed' && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'var(--success)' }}
                    onClick={() => {
                      updateAppointmentStatus(selectedAppDetails.id, 'completed')
                      setSelectedAppDetails(null)
                    }}
                  >
                    Označi kao završen
                  </button>
                )}
                {selectedAppDetails.status !== 'completed' && selectedAppDetails.status !== 'cancelled' && selectedAppDetails.status !== 'no_show' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                      onClick={() => {
                        updateAppointmentStatus(selectedAppDetails.id, 'no_show')
                        setSelectedAppDetails(null)
                      }}
                    >
                      No-Show
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      onClick={() => {
                        updateAppointmentStatus(selectedAppDetails.id, 'cancelled')
                        setSelectedAppDetails(null)
                      }}
                    >
                      Otkaži termin
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  onClick={() => setSelectedAppDetails(null)}
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BLOCK TIME OVERLAY MODAL */}
        {showBlockModal && (
          <div className="auth-overlay" onClick={() => setShowBlockModal(false)}>
            <div className="glass-panel auth-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>🔒 Blokiraj Vreme</h3>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: 'auto' }}
                  onClick={() => setShowBlockModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBlockTimeSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Datum</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Početno vreme</label>
                  <input
                    type="time"
                    className="form-input"
                    required
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Trajanje blokade</label>
                  <select
                    className="form-input"
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value)}
                  >
                    <option value="30">30 minuta</option>
                    <option value="60">1 sat (60 min)</option>
                    <option value="90">1.5 sat (90 min)</option>
                    <option value="120">2 sata (120 min)</option>
                    <option value="180">3 sata (180 min)</option>
                    <option value="240">4 sata (240 min)</option>
                    <option value="480">Ceo radni dan (8 sati)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Razlog / Beleška (opciono)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Npr. Zubar, Privatne obaveze, Ručak"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBlockModal(false)}
                  >
                    Otkaži
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Blokiraj
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MANUAL BOOKING OVERLAY MODAL */}
        {showManualBookModal && (
          <div className="auth-overlay" onClick={() => setShowManualBookModal(false)}>
            <div className="glass-panel auth-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>➕ Ručno Zakazivanje</h3>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: 'auto' }}
                  onClick={() => setShowManualBookModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleManualBookingSubmit}>
                {/* Client Selection Type */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      name="clientType"
                      checked={mbIsNewClient}
                      onChange={() => setMbIsNewClient(true)}
                    />
                    Novi klijent
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      name="clientType"
                      checked={!mbIsNewClient}
                      onChange={() => setMbIsNewClient(false)}
                    />
                    Postojeći klijent
                  </label>
                </div>

                {/* Client Fields */}
                {mbIsNewClient ? (
                  <>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">Ime i prezime klijenta *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="Npr. Milica Petrović"
                        value={mbClientName}
                        onChange={(e) => setMbClientName(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">Broj telefona *</label>
                      <input
                        type="tel"
                        className="form-input"
                        required
                        placeholder="06xXXXXXXX"
                        value={mbClientPhone}
                        onChange={(e) => setMbClientPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">Email adresa (opciono)</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="milica@gmail.com"
                        value={mbClientEmail}
                        onChange={(e) => setMbClientEmail(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Izaberite klijentkinju *</label>
                    <select
                      className="form-input"
                      required
                      value={mbSelectedClientId}
                      onChange={(e) => setMbSelectedClientId(e.target.value)}
                    >
                      <option value="">-- Izaberite iz baze --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Service Field */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Usluga *</label>
                  <select
                    className="form-input"
                    required
                    value={mbSelectedServiceId}
                    onChange={(e) => setMbSelectedServiceId(e.target.value)}
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.price} RSD, {s.duration_minutes} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Datum *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={mbDate}
                      onChange={(e) => setMbDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vreme *</label>
                    <input
                      type="time"
                      className="form-input"
                      required
                      value={mbTime}
                      onChange={(e) => setMbTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Silent Appointment option */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={mbSilent}
                      onChange={(e) => setMbSilent(e.target.checked)}
                    />
                    Tihi termin 🤫 (Klijent ne želi ćaskanje)
                  </label>
                </div>

                {/* Submit buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowManualBookModal(false)}
                  >
                    Otkaži
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Zakaži termin
                  </button>
                </div>
              </form>
            </div>
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
          <div className="glass-panel panel-card animate-fade-in" style={{ maxWidth: '650px' }}>
            <h3>Podešavanja Salona</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Uredite informacije koje klijenti vide na Vašoj stranici i konfigurišite radno vreme
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">Naziv Salona</label>
                <input
                  type="text"
                  className="form-input"
                  required
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

              {/* Working Hours configuration */}
              <div className="form-group" style={{ marginTop: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <label className="form-label" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Radno Vreme Salona</label>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '16px' }}>
                  Označite dane kojima radite i podesite satnicu. Neradni dani biće zatvoreni za online rezervacije.
                </p>
                <table className="working-hours-table">
                  <tbody>
                    {[
                      { key: 'mon', label: 'Ponedeljak' },
                      { key: 'tue', label: 'Utorak' },
                      { key: 'wed', label: 'Sreda' },
                      { key: 'thu', label: 'Četvrtak' },
                      { key: 'fri', label: 'Petak' },
                      { key: 'sat', label: 'Subota' },
                      { key: 'sun', label: 'Nedelja' }
                    ].map((day) => {
                      const hours = salon?.working_hours?.[day.key] || { open: '09:00', close: '17:00', is_working: false }
                      return (
                        <tr key={day.key}>
                          <td style={{ width: '140px', border: 'none' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                              <input
                                type="checkbox"
                                style={{ cursor: 'pointer' }}
                                checked={hours.is_working}
                                onChange={() => {
                                  const updated = { ...salon.working_hours }
                                  if (!updated[day.key]) {
                                    updated[day.key] = { open: '09:00', close: '17:00', is_working: true }
                                  } else {
                                    updated[day.key].is_working = !updated[day.key].is_working
                                  }
                                  setSalon({ ...salon, working_hours: updated })
                                }}
                              />
                              {day.label}
                            </label>
                          </td>
                          <td style={{ border: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: hours.is_working ? 1 : 0.45 }}>
                              <input
                                type="time"
                                className="form-input"
                                style={{ padding: '6px 10px', width: '100px', fontSize: '0.85rem' }}
                                disabled={!hours.is_working}
                                value={hours.open || '09:00'}
                                onChange={(e) => {
                                  const updated = { ...salon.working_hours }
                                  updated[day.key].open = e.target.value
                                  setSalon({ ...salon, working_hours: updated })
                                }}
                              />
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>do</span>
                              <input
                                type="time"
                                className="form-input"
                                style={{ padding: '6px 10px', width: '100px', fontSize: '0.85rem' }}
                                disabled={!hours.is_working}
                                value={hours.close || '17:00'}
                                onChange={(e) => {
                                  const updated = { ...salon.working_hours }
                                  updated[day.key].close = e.target.value
                                  setSalon({ ...salon, working_hours: updated })
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }} disabled={settingsSaving}>
                  {settingsSaving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
