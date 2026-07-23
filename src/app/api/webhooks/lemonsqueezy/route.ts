import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured.')
    return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 })
  }

  // 1. Get raw request body
  const rawBody = await request.text()

  // 2. Get the signature from headers
  const signature = request.headers.get('x-signature') ?? ''

  // 3. Verify signature
  const hmac = crypto.createHmac('sha256', secret)
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'hex')
  const signatureBuffer = Buffer.from(signature, 'hex')

  try {
    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.warn('Webhook validation failed: Invalid signature digest.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch (error) {
    console.warn('Webhook validation failed: Error comparing signatures.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 4. Parse the payload
  const body = JSON.parse(rawBody)
  const eventName = body.meta?.event_name
  const salonId = body.meta?.custom_data?.salon_id

  console.log(`Received Lemon Squeezy webhook event: ${eventName} for salon ID: ${salonId}`)

  if (!salonId) {
    console.warn('Webhook received without salon_id in custom_data. Ignoring.')
    return NextResponse.json({ received: true, ignored: true, message: 'No salon_id provided' })
  }

  const attributes = body.data?.attributes
  if (!attributes) {
    console.warn('Webhook received without attributes. Ignoring.')
    return NextResponse.json({ received: true, ignored: true, message: 'No attributes provided' })
  }

  const status = attributes.status // 'active', 'on_trial', 'paused', 'past_due', 'unpaid', 'cancelled', 'expired'
  const endsAt = attributes.ends_at
  const renewsAt = attributes.renews_at
  const trialEndsAt = attributes.trial_ends_at

  let dbStatus = 'expired'
  let expiresAt = endsAt || renewsAt || trialEndsAt

  if (status === 'active') {
    dbStatus = 'active'
    expiresAt = renewsAt || endsAt
  } else if (status === 'on_trial') {
    dbStatus = 'trial'
    expiresAt = trialEndsAt
  } else if (status === 'cancelled') {
    if (endsAt && new Date(endsAt).getTime() > Date.now()) {
      dbStatus = 'active'
      expiresAt = endsAt
    } else {
      dbStatus = 'expired'
    }
  } else {
    dbStatus = 'expired'
  }

  // 5. Update salon subscription in Supabase using Admin client to bypass RLS
  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from('salons')
      .update({
        subscription_status: dbStatus,
        subscription_expires_at: expiresAt,
        billing_portal_url: attributes.urls?.customer_portal || null
      })
      .eq('id', salonId)
      .select()

    if (error) {
      console.error('Error updating salon subscription in Supabase:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    console.log(`Successfully updated salon ${salonId} status to ${dbStatus}, expires at: ${expiresAt}`, data)
    return NextResponse.json({ received: true, updated: true })
  } catch (error) {
    console.error('Failed to process webhook database transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
