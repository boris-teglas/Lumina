import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  return createClient(url, key)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Nedostaje ID termina.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        status,
        salons ( id, name, slug, phone, owner_email, theme_color ),
        services ( name, price, duration_minutes ),
        clients ( full_name, phone, email )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Termin nije pronađen ili je link nevažeći.' }, { status: 404 })
    }

    return NextResponse.json({ appointment: data })
  } catch (err: any) {
    console.error('Cancel booking GET error:', err)
    return NextResponse.json({ error: err.message || 'Greška na serveru.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json({ error: 'Nedostaje ID termina.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Fetch appointment details
    const { data: app, error: fetchErr } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        status,
        salons ( name, phone, owner_email ),
        services ( name ),
        clients ( full_name, phone )
      `)
      .eq('id', appointmentId)
      .single()

    if (fetchErr || !app) {
      return NextResponse.json({ error: 'Termin nije pronađen.' }, { status: 404 })
    }

    if (app.status === 'cancelled') {
      return NextResponse.json({ success: true, message: 'Termin je već otkazan.' })
    }

    const startTime = new Date(app.start_time)
    const now = new Date()
    const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 5) {
      return NextResponse.json({
        error: 'Otkazivanje preko linka je moguće najkasnije 5 sati pre početka termina.'
      }, { status: 400 })
    }

    // 2. Update status to 'cancelled'
    const { error: updateErr } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 3. Notify salon owner via Email asynchronously
    const salonOwnerEmail = (app as any).salons?.owner_email
    if (salonOwnerEmail) {
      const formattedDate = startTime.toLocaleDateString('sr-RS', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      const formattedTime = startTime.toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit'
      })

      fetch(`${new URL(req.url).origin}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cancellation_notification',
          salonName: (app as any).salons?.name,
          serviceName: (app as any).services?.name || 'Usluga',
          clientName: (app as any).clients?.full_name || 'Klijent',
          clientPhone: (app as any).clients?.phone || '',
          date: formattedDate,
          time: formattedTime,
          salonOwnerEmail: salonOwnerEmail
        })
      }).catch(err => console.warn('Email notification error:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Cancel booking POST error:', err)
    return NextResponse.json({ error: err.message || 'Greška pri otkazivanju.' }, { status: 500 })
  }
}
