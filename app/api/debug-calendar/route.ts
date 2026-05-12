import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!rawKey) {
      return NextResponse.json({ error: 'GOOGLE_SERVICE_ACCOUNT_KEY not set' }, { status: 500 })
    }

    let credentials
    try {
      credentials = JSON.parse(rawKey)
    } catch (e) {
      return NextResponse.json({
        error: 'JSON parse failed',
        detail: String(e),
        first10chars: rawKey.slice(0, 10),
        last10chars: rawKey.slice(-10),
      }, { status: 500 })
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    // Try to list next event to test connection
    const res = await calendar.events.list({
      calendarId,
      maxResults: 1,
    })

    // Create a test event for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(11, 0, 0, 0)
    const end = new Date(tomorrow)
    end.setMinutes(end.getMinutes() + 30)

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: '✅ TEST - Orient Barbershop Debug',
        description: 'Evento de teste para confirmar integração Google Calendar',
        start: { dateTime: tomorrow.toISOString(), timeZone: 'Europe/Zurich' },
        end: { dateTime: end.toISOString(), timeZone: 'Europe/Zurich' },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Calendar event created!',
      eventId: event.data.id,
      eventLink: event.data.htmlLink,
      calendarId,
      clientEmail: credentials.client_email,
    })
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number; errors?: unknown }
    return NextResponse.json({
      error: 'Calendar API error',
      detail: err.message,
      status: err.status,
      errors: err.errors,
    }, { status: 500 })
  }
}
