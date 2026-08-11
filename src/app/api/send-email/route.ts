import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY is missing')
      return NextResponse.json({ error: 'RESEND_API_KEY is missing' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const body = await req.json()
    const {
      type,
      clientEmail,
      clientName,
      clientPhone,
      salonName,
      salonSlug,
      serviceName,
      servicePrice,
      durationMinutes,
      date,
      time,
      silentAppointment,
      salonOwnerEmail
    } = body

    if (!type) {
      return NextResponse.json({ error: 'Missing email type' }, { status: 400 })
    }

    // Default sender address using verified glowlink.me domain
    const sender = 'GlowLink <podrska@glowlink.me>'

    if (type === 'booking_confirmation') {
      const formattedPrice = servicePrice ? `${servicePrice.toLocaleString('sr-RS')} RSD` : ''
      const dateFormatted = new Date(date).toLocaleDateString('sr-RS', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const emailsToSend = []

      // 1. Email to Client (if email provided)
      if (clientEmail && clientEmail.includes('@')) {
        const clientHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
            .card { max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #ec4899; text-decoration: none; }
            .title { font-size: 20px; color: #f8fafc; font-weight: 700; margin-top: 12px; }
            .badge { display: inline-block; background: rgba(236, 72, 153, 0.15); color: #f472b6; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-top: 8px; }
            .footer { text-align: center; font-size: 13px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 20px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #ec4899, #d946ef); color: #ffffff !important; padding: 12px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo">✦ GlowLink</div>
              <div class="title">Vaš termin je uspešno zakazan! 🌸</div>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Zdravo ${clientName}, radujemo se vašoj poseti salonu <strong>${salonName}</strong>.</p>
            </div>

            <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Salon:</td>
                  <td style="padding: 8px 0; color: #f8fafc; font-weight: 700; text-align: right;">${salonName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Usluga:</td>
                  <td style="padding: 8px 0; color: #f8fafc; font-weight: 700; text-align: right;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Datum i vreme:</td>
                  <td style="padding: 8px 0; color: #ec4899; font-weight: 700; text-align: right;">${dateFormatted} u ${time}h</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Trajanje:</td>
                  <td style="padding: 8px 0; color: #f8fafc; font-weight: 600; text-align: right;">${durationMinutes} min</td>
                </tr>
                ${formattedPrice ? `
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Cena:</td>
                  <td style="padding: 8px 0; color: #34d399; font-weight: 700; text-align: right;">${formattedPrice}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${silentAppointment ? `
              <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #c084fc;">
                🤫 <strong>Tihi termin izabran:</strong> Salon je obavešten da tokom tretmana želite potpunu tišinu i opuštanje uz minimalan razgovor.
              </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="https://glowlink.me/${salonSlug}" class="btn">Pogledaj profil salona</a>
            </div>

            <div class="footer">
              <p>Potrebna vam je izmena termina? Molimo kontaktirajte salon direktno na vreme.</p>
              <p>© ${new Date().getFullYear()} GlowLink.me – Pametno zakazivanje za kozmetičke salone.</p>
            </div>
          </div>
        </body>
        </html>
        `

        emailsToSend.push(
          resend.emails.send({
            from: sender,
            to: [clientEmail],
            subject: `Potvrda rezervacije - ${salonName}`,
            html: clientHtml
          })
        )
      }

      // 2. Email to Salon Owner (if owner email exists)
      if (salonOwnerEmail && salonOwnerEmail.includes('@')) {
        const ownerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
            .card { max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; }
            .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 22px; font-weight: 800; color: #ec4899; }
            .title { font-size: 18px; color: #34d399; font-weight: 700; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo">✦ GlowLink Notifikacija</div>
              <div class="title">Nova rezervacija preko GlowLink-a! 🎉</div>
            </div>

            <p style="font-size: 15px; color: #cbd5e1;">Stigla je nova rezervacija za vaš salon <strong>${salonName}</strong>:</p>

            <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 6px 0; color: #94a3b8;"><strong>Klijent:</strong> <span style="color: #f8fafc;">${clientName}</span></p>
              <p style="margin: 6px 0; color: #94a3b8;"><strong>Telefon:</strong> <span style="color: #f8fafc;">${clientPhone}</span></p>
              ${clientEmail ? `<p style="margin: 6px 0; color: #94a3b8;"><strong>Email:</strong> <span style="color: #f8fafc;">${clientEmail}</span></p>` : ''}
              <p style="margin: 6px 0; color: #94a3b8;"><strong>Usluga:</strong> <span style="color: #f8fafc;">${serviceName} (${durationMinutes} min)</span></p>
              <p style="margin: 6px 0; color: #94a3b8;"><strong>Termin:</strong> <span style="color: #ec4899; font-weight: bold;">${date} u ${time}h</span></p>
              ${formattedPrice ? `<p style="margin: 6px 0; color: #94a3b8;"><strong>Cena:</strong> <span style="color: #34d399; font-weight: bold;">${formattedPrice}</span></p>` : ''}
              ${silentAppointment ? `<p style="margin: 10px 0 0 0; color: #a78bfa; font-weight: bold;">🤫 Tihi termin – minimalan razgovor po želji klijenta.</p>` : ''}
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://glowlink.me/dashboard" style="background: #ec4899; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Otvorite Nadzornu Tablu</a>
            </div>
          </div>
        </body>
        </html>
        `

        emailsToSend.push(
          resend.emails.send({
            from: sender,
            to: [salonOwnerEmail],
            subject: `Nova rezervacija: ${clientName} - ${serviceName}`,
            html: ownerHtml
          })
        )
      }

      const results = await Promise.all(emailsToSend)
      return NextResponse.json({ success: true, results })
    }

    return NextResponse.json({ error: 'Unsupported email type' }, { status: 400 })
  } catch (err: any) {
    console.error('Resend email error:', err)
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }
}
