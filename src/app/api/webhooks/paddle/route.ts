import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET

  if (!secret) {
    console.error('PADDLE_WEBHOOK_SECRET is not configured.')
    return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 })
  }

  const rawBody = await request.text()

  // Paddle signature format: ts=timestamp;h1=hmac
  const signatureHeader = request.headers.get('paddle-signature') ?? ''
  const parts = Object.fromEntries(signatureHeader.split(';').map(p => p.split('=')))
  const ts = parts['ts']
  const h1 = parts['h1']

  if (!ts || !h1) {
    console.warn('Webhook validation failed: Missing signature parts.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Verify HMAC-SHA256
  const signedPayload = `${ts}:${rawBody}`
  const expectedHmac = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(expectedHmac, 'hex'), Buffer.from(h1, 'hex'))) {
      console.warn('Webhook validation failed: Invalid HMAC signature.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch {
    console.warn('Webhook validation failed: Error comparing signatures.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)
  const eventType = body.event_type as string
  const data = body.data

  console.log(`Received Paddle webhook event: ${eventType}`)

  if (!data) {
    return NextResponse.json({ received: true, ignored: true, message: 'No data provided' })
  }

  // Extract salon_id from custom_data
  const salonId = data.custom_data?.salon_id
  if (!salonId) {
    console.warn('Webhook received without salon_id in custom_data. Ignoring.')
    return NextResponse.json({ received: true, ignored: true, message: 'No salon_id provided' })
  }

  const status = data.status as string
  const scheduledChange = data.scheduled_change
  const currentBillingPeriod = data.current_billing_period
  const nextBilledAt = data.next_billed_at

  let dbStatus = 'expired'
  let expiresAt: string | null = null

  if (eventType === 'transaction.completed' || eventType === 'transaction.paid') {
    if (data.status === 'completed' || data.status === 'paid') {
      dbStatus = 'active'
      expiresAt = data.billing_period?.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  } else if (eventType === 'subscription.activated' || eventType === 'subscription.updated' || eventType === 'subscription.created') {
    if (status === 'active' || status === 'trialing') {
      dbStatus = 'active'
      expiresAt = nextBilledAt || currentBillingPeriod?.ends_at || null
    } else if (status === 'canceled') {
      const endsAt = scheduledChange?.effective_at || currentBillingPeriod?.ends_at
      if (endsAt && new Date(endsAt).getTime() > Date.now()) {
        dbStatus = 'active'
        expiresAt = endsAt
      } else {
        dbStatus = 'expired'
      }
    }
  } else if (eventType === 'subscription.canceled') {
    const endsAt = scheduledChange?.effective_at || currentBillingPeriod?.ends_at
    if (endsAt && new Date(endsAt).getTime() > Date.now()) {
      dbStatus = 'active'
      expiresAt = endsAt
    } else {
      dbStatus = 'expired'
    }
  } else if (eventType === 'subscription.past_due') {
    dbStatus = 'expired'
  }

  const managementUrls = data.management_urls
  const billingPortalUrl = managementUrls?.update_payment_method || managementUrls?.cancel || null

  try {
    const supabaseAdmin = createAdminClient()
    const { data: updatedData, error } = await supabaseAdmin
      .from('salons')
      .update({
        subscription_status: dbStatus,
        subscription_expires_at: expiresAt,
        billing_portal_url: billingPortalUrl,
      })
      .eq('id', salonId)
      .select()

    if (error) {
      console.error('Error updating salon subscription in Supabase:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    console.log(`Successfully updated salon ${salonId} to status "${dbStatus}", expires: ${expiresAt}`, updatedData)
    return NextResponse.json({ received: true, updated: true })
  } catch (error) {
    console.error('Failed to process webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
