import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordAnonymizedEvent } from '@/lib/analytics'
import type { BookingRequest } from '@/lib/types'

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  const body: BookingRequest = await req.json()
  const {
    serviceId, barberId, date, startTime,
    firstName, lastName, email, phone,
    postalCode, birthYear, analyticsConsent,
  } = body

  if (!serviceId || !barberId || !date || !startTime || !firstName || !email) {
    return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 })
  }

  // Use admin client (service role) — server-side route, bypasses RLS safely
  const db = createAdminClient()

  const { data: service, error: serviceErr } = await db
    .from('services')
    .select('name, duration_minutes, price_chf, category')
    .eq('id', serviceId)
    .single()

  if (serviceErr || !service) {
    return NextResponse.json({ error: 'Service nicht gefunden' }, { status: 404 })
  }

  const { data: barber, error: barberErr } = await db
    .from('barbers')
    .select('name')
    .eq('id', barberId)
    .single()

  if (barberErr || !barber) {
    return NextResponse.json({ error: 'Barber nicht gefunden' }, { status: 404 })
  }

  const endTime = addMinutes(startTime, service.duration_minutes)

  // Race-condition guard: verify slot is still free
  const { data: conflict } = await db
    .from('bookings')
    .select('id')
    .eq('barber_id', barberId)
    .eq('booking_date', date)
    .in('status', ['confirmed', 'completed'])
    .lt('start_time', endTime)
    .gt('end_time', startTime)
    .maybeSingle()

  if (conflict) {
    return NextResponse.json(
      { error: 'Dieser Zeitslot ist leider nicht mehr verfügbar' },
      { status: 409 }
    )
  }

  const { data: booking, error: bookingErr } = await db
    .from('bookings')
    .insert({
      barber_id: barberId,
      service_id: serviceId,
      booking_date: date,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed',
      price_chf: service.price_chf,
      service_name: service.name,
      barber_name: barber.name,
      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_email: email,
      guest_phone: phone || null,
      guest_postal_code: postalCode || null,
      guest_birth_year: birthYear ? parseInt(birthYear, 10) : null,
      guest_analytics_consent: analyticsConsent,
    })
    .select('id')
    .single()

  if (bookingErr || !booking) {
    console.error('Booking insert error:', bookingErr)
    return NextResponse.json({ error: 'Buchung fehlgeschlagen' }, { status: 500 })
  }

  // Write anonymized analytics event (only if user consented)
  await recordAnonymizedEvent(db, {
    eventType: 'booking_completed',
    serviceCategory: service.category,
    priceCHF: Number(service.price_chf),
    date,
    startTime,
    postalCode: postalCode || undefined,
    birthYear: birthYear ? parseInt(birthYear, 10) : undefined,
    analyticsConsent,
  })

  return NextResponse.json({ bookingId: booking.id, success: true })
}

// GET /api/bookings — admin only
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient()
  const { data: role } = await db
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (role?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const dateFrom = searchParams.get('from') ?? new Date().toISOString().slice(0, 10)
  const dateTo = searchParams.get('to') ?? dateFrom

  const { data: bookings, error } = await db
    .from('bookings')
    .select('*')
    .gte('booking_date', dateFrom)
    .lte('booking_date', dateTo)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ bookings })
}
