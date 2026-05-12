import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function generateSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM

  for (let t = startTotal; t + durationMinutes <= endTotal; t += 30) {
    const h = Math.floor(t / 60).toString().padStart(2, '0')
    const m = (t % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
  }
  return slots
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// GET /api/availability?barberId=&date=YYYY-MM-DD&duration=30
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const barberId = searchParams.get('barberId')
  const date = searchParams.get('date')
  const duration = parseInt(searchParams.get('duration') ?? '30', 10)

  if (!barberId || !date) {
    return NextResponse.json({ error: 'Missing barberId or date' }, { status: 400 })
  }

  const db = createAdminClient()

  // Day of week: JS 0=Sun → convert to 0=Mon
  const jsDay = new Date(date).getDay()
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1

  // Check for exception (day off or modified hours)
  const { data: exception } = await db
    .from('barber_exceptions')
    .select('*')
    .eq('barber_id', barberId)
    .eq('exception_date', date)
    .maybeSingle()

  if (exception?.is_day_off) {
    return NextResponse.json({ slots: [] })
  }

  let workStart: string
  let workEnd: string

  if (exception?.start_time && exception?.end_time) {
    workStart = exception.start_time
    workEnd = exception.end_time
  } else {
    const { data: schedule } = await db
      .from('barber_schedules')
      .select('start_time, end_time')
      .eq('barber_id', barberId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .maybeSingle()

    if (!schedule) return NextResponse.json({ slots: [] })
    workStart = schedule.start_time
    workEnd = schedule.end_time
  }

  const { data: bookings } = await db
    .from('bookings')
    .select('start_time, end_time')
    .eq('barber_id', barberId)
    .eq('booking_date', date)
    .in('status', ['confirmed', 'completed'])

  const bookedRanges = (bookings ?? []).map(b => ({
    start: timeToMinutes(b.start_time),
    end: timeToMinutes(b.end_time),
  }))

  const allSlots = generateSlots(workStart, workEnd, duration)
  const now = new Date()
  const isToday = date === now.toISOString().slice(0, 10)
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + 30

  const available = allSlots.filter(slot => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + duration
    if (isToday && slotStart <= nowMinutes) return false
    return !bookedRanges.some(r => slotStart < r.end && slotEnd > r.start)
  })

  return NextResponse.json({ slots: available })
}
