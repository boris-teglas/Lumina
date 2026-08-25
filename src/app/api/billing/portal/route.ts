import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const apiKey = process.env.PADDLE_API_KEY
    if (!apiKey) {
      console.error('PADDLE_API_KEY is not configured.')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    const baseUrl = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.startsWith('test_')
      ? 'https://sandbox-api.paddle.com'
      : 'https://api.paddle.com'

    // 1. Search for customer in Paddle by user email
    const custRes = await fetch(`${baseUrl}/customers?email=${encodeURIComponent(user.email)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    const custData = await custRes.json()
    const customerId = custData.data?.[0]?.id

    if (!customerId) {
      console.warn(`No Paddle customer found for email: ${user.email}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. Create customer portal session
    const portalRes = await fetch(`${baseUrl}/customers/${customerId}/portal-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const portalData = await portalRes.json()
    const portalUrl = portalData.data?.urls?.general?.overview

    if (!portalUrl) {
      console.error('Failed to generate Paddle customer portal URL:', portalData)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.redirect(portalUrl)
  } catch (error) {
    console.error('Customer portal redirection error:', error)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
