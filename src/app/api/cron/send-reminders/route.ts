import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/utils/supabase/admin'

/**
 * Vercel Cron Job: Send 24-hour appointment reminders
 * Schedule: Daily at 7:00 UTC (9:00 AM Serbian summer time)
 * Protected by CRON_SECRET header that Vercel automatically sends
 *
 * Logic: Finds all pending/confirmed appointments starting between
 * 22 and 26 hours from now (buffer handles minor cron timing drift)
 */
export async function GET(request: NextRequest) {
  // 1. Verify this request is coming from Vercel Cron (or a trusted source)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is missing' }, { status: 500 })
  }

  const resend = new Resend(resendApiKey)
  const supabase = createAdminClient()

  // 2. Calculate the 24h window (22h - 26h from now to handle drift)
  const now = new Date()
  const windowStart = new Date(now.getTime() + 22 * 60 * 60 * 1000) // +22h
  const windowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000)   // +26h

  console.log(`[Cron] Sending reminders for appointments between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`)

  try {
    // 3. Fetch appointments in the 24h window with all related data
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        silent_appointment,
        price_charged,
        clients (
          full_name,
          phone,
          email
        ),
        services (
          name,
          duration_minutes,
          price
        ),
        salons (
          id,
          name,
          slug,
          profiles (
            id
          )
        )
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', windowStart.toISOString())
      .lte('start_time', windowEnd.toISOString())

    if (error) {
      console.error('[Cron] Supabase query error:', error)
      return NextResponse.json({ error: 'Database query failed', detail: error.message }, { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      console.log('[Cron] No appointments found for reminder window.')
      return NextResponse.json({ success: true, sent: 0, message: 'No appointments in the next 24h window' })
    }

    // 4. Get salon owner emails via auth.users (using admin client)
    const salonOwnerIds = [
      ...new Set(
        appointments
          .map((a: any) => a.salons?.profiles?.id)
          .filter(Boolean)
      )
    ]

    // Build a map of profile_id -> email using admin auth API
    const ownerEmailMap: Record<string, string> = {}
    for (const userId of salonOwnerIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId as string)
        if (userData?.user?.email) {
          ownerEmailMap[userId as string] = userData.user.email
        }
      } catch {
        // Skip if we can't get the email for this user
      }
    }

    // 5. Send reminder emails
    let sentCount = 0
    const errors: string[] = []

    for (const appointment of appointments as any[]) {
      const client = appointment.clients
      const service = appointment.services
      const salon = appointment.salons

      if (!client || !service || !salon) continue

      // Format the appointment time nicely in Serbian
      const startTime = new Date(appointment.start_time)
      const dateFormatted = startTime.toLocaleDateString('sr-RS', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Europe/Belgrade'
      })
      const timeFormatted = startTime.toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Belgrade'
      })

      const formattedPrice = appointment.price_charged
        ? `${Number(appointment.price_charged).toLocaleString('sr-RS')} RSD`
        : service.price
          ? `${Number(service.price).toLocaleString('sr-RS')} RSD`
          : null

      // Send reminder to client (only if they have email)
      if (client.email && client.email.includes('@')) {
        try {
          const clientHtml = buildClientReminderEmail({
            clientName: client.full_name,
            salonName: salon.name,
            salonSlug: salon.slug,
            serviceName: service.name,
            durationMinutes: service.duration_minutes,
            dateFormatted,
            timeFormatted,
            formattedPrice,
            silentAppointment: appointment.silent_appointment,
          })

          await resend.emails.send({
            from: 'GlowLink <podrska@glowlink.me>',
            to: [client.email],
            subject: `⏰ Podsetnik: Vaš termin u salonu ${salon.name} je sutra!`,
            html: clientHtml,
          })

          sentCount++
          console.log(`[Cron] Sent reminder to client ${client.full_name} (${client.email}) for appointment ${appointment.id}`)
        } catch (emailErr: any) {
          errors.push(`Failed to send to ${client.email}: ${emailErr.message}`)
          console.error(`[Cron] Failed to send reminder to ${client.email}:`, emailErr)
        }
      }
    }

    console.log(`[Cron] Done. Sent ${sentCount} reminders. Errors: ${errors.length}`)
    return NextResponse.json({
      success: true,
      sent: sentCount,
      totalAppointments: appointments.length,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (err: any) {
    console.error('[Cron] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', detail: err.message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Email Template Builder
// ---------------------------------------------------------------------------

interface ReminderEmailParams {
  clientName: string
  salonName: string
  salonSlug: string
  serviceName: string
  durationMinutes: number
  dateFormatted: string
  timeFormatted: string
  formattedPrice: string | null
  silentAppointment: boolean
}

function buildClientReminderEmail(p: ReminderEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #0f172a;
          color: #f8fafc;
          margin: 0;
          padding: 20px;
        }
        .card {
          max-width: 560px;
          margin: 0 auto;
          background: #1e293b;
          border-radius: 16px;
          border: 1px solid #334155;
          padding: 32px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #334155;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: #ec4899;
        }
        .reminder-badge {
          display: inline-block;
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          margin-top: 12px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .title {
          font-size: 20px;
          color: #f8fafc;
          font-weight: 700;
          margin-top: 12px;
        }
        .details-box {
          background: #0f172a;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
        }
        .details-table td {
          padding: 8px 0;
        }
        .label {
          color: #94a3b8;
          font-size: 14px;
          width: 40%;
        }
        .value {
          color: #f8fafc;
          font-weight: 700;
          text-align: right;
        }
        .value-highlight {
          color: #ec4899;
          font-weight: 700;
          text-align: right;
          font-size: 16px;
        }
        .value-price {
          color: #34d399;
          font-weight: 700;
          text-align: right;
        }
        .silent-box {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #c084fc;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #ec4899, #d946ef);
          color: #ffffff !important;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          margin-top: 8px;
        }
        .checklist {
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .checklist p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #6ee7b7;
          font-weight: 600;
        }
        .checklist ul {
          margin: 0;
          padding-left: 20px;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.8;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #475569;
          margin-top: 28px;
          border-top: 1px solid #334155;
          padding-top: 20px;
          line-height: 1.7;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">✦ GlowLink</div>
          <div class="reminder-badge">⏰ Podsetnik za sutra</div>
          <div class="title">Vidimo se sutra, ${p.clientName}! 🌸</div>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">
            Samo da vas podsetimo na vaš zakazani termin u salonu <strong>${p.salonName}</strong>.
          </p>
        </div>

        <div class="details-box">
          <table class="details-table">
            <tr>
              <td class="label">Salon:</td>
              <td class="value">${p.salonName}</td>
            </tr>
            <tr>
              <td class="label">Usluga:</td>
              <td class="value">${p.serviceName}</td>
            </tr>
            <tr>
              <td class="label">Trajanje:</td>
              <td class="value">${p.durationMinutes} min</td>
            </tr>
            <tr>
              <td class="label">Datum:</td>
              <td class="value-highlight">${p.dateFormatted}</td>
            </tr>
            <tr>
              <td class="label">Vreme:</td>
              <td class="value-highlight">${p.timeFormatted}h</td>
            </tr>
            ${p.formattedPrice ? `
            <tr>
              <td class="label">Cena:</td>
              <td class="value-price">${p.formattedPrice}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${p.silentAppointment ? `
        <div class="silent-box">
          🤫 <strong>Tihi termin:</strong> Odabrali ste termin sa minimalnim razgovorom za maksimalno opuštanje. Salon je obavešten.
        </div>
        ` : ''}

        <div class="checklist">
          <p>✅ Kratki podsetnik za sutrašnji poseta:</p>
          <ul>
            <li>Dođite 5 minuta ranije</li>
            <li>Ako morate da otkažete, javite se salonu što pre</li>
            <li>Svi detalji termina su u emailu ispod</li>
          </ul>
        </div>

        <div style="text-align: center;">
          <a href="https://glowlink.me/${p.salonSlug}" class="btn">
            Pogledaj profil salona
          </a>
        </div>

        <div class="footer">
          <p>Ovaj podsetnik je automatski poslat od strane GlowLink sistema.</p>
          <p>Potebna vam je izmena termina? Kontaktirajte salon direktno.</p>
          <p style="margin-top: 8px;">© ${new Date().getFullYear()} <a href="https://glowlink.me" style="color: #ec4899;">GlowLink.me</a> – Pametno zakazivanje za kozmetičke salone.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
