import { google } from 'googleapis'

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}')

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/calendar'],
})

const calendar = google.calendar({ version: 'v3', auth })

export async function createCalendarEvent(booking: {
  barber_name: string
  service_name: string
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  booking_date: string
  start_time: string
  end_time: string
}) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    // Parse date and time
    const [year, month, day] = booking.booking_date.split('-').map(Number)
    const [startHour, startMin] = booking.start_time.split(':').map(Number)
    const [endHour, endMin] = booking.end_time.split(':').map(Number)

    const startDateTime = new Date(year, month - 1, day, startHour, startMin)
    const endDateTime = new Date(year, month - 1, day, endHour, endMin)

    const event = {
      summary: `✂️ ${booking.service_name} — ${booking.guest_first_name} ${booking.guest_last_name}`,
      description: `Barbeiro: ${booking.barber_name}\nCliente: ${booking.guest_first_name} ${booking.guest_last_name}\nEmail: ${booking.guest_email}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Zurich',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Zurich',
      },
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    })

    console.log('Calendar event created:', response.data.id)
    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}
