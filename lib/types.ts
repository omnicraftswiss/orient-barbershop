export interface Barber {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
  specialties: string[]
  is_active: boolean
  display_order: number
}

export interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_chf: number
  category: string
  is_active: boolean
  display_order: number
}

export interface BarberSchedule {
  id: string
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Booking {
  id: string
  customer_id: string | null
  barber_id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes: string | null
  price_chf: number | null
  service_name: string | null
  barber_name: string | null
  guest_first_name: string | null
  guest_last_name: string | null
  guest_email: string | null
  guest_phone: string | null
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  event_type: string
  service_category: string | null
  spend_bucket: string | null
  postal_prefix: string | null
  age_group: string | null
  day_of_week: number | null
  time_bucket: string | null
  month_year: string | null
  visit_frequency_bucket: string | null
  product_categories: string[]
  shop_id: string | null
  created_at: string
}

export interface BookingRequest {
  serviceId: string
  barberId: string
  date: string         // YYYY-MM-DD
  startTime: string    // HH:MM
  firstName: string
  lastName: string
  email: string
  phone: string
  postalCode: string
  birthYear: string
  analyticsConsent: boolean
  marketingConsent: boolean
}
