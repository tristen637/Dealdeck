import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Subscription / trial check
    const admin = createAdminSupabase()
    const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
    const isSubscribed = profile?.stripe_status === 'active'
    const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null
    const isOnTrial = trialEnd && trialEnd > new Date()

    if (!isSubscribed && !isOnTrial) {
      return NextResponse.json({ error: 'subscription_required' }, { status: 403 })
    }

    // Trial usage limit
    if (isOnTrial && !isSubscribed) {
      const { count } = await admin
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if ((count ?? 0) >= 5) {
        return NextResponse.json({ error: 'trial_limit_reached' }, { status: 403 })
      }
    }

    const { messages } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages,
    })

    // Log usage
    await admin.from('analyses').insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
    })

    // Return in Anthropic API shape so the client code works unchanged
    return NextResponse.json({ content: response.content })
  } catch (err: any) {
    console.error('Underwrite error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
