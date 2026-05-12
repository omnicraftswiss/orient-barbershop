import type { SupabaseClient } from '@supabase/supabase-js'

export function getSpendBucket(amount: number): string {
  if (amount < 30) return '<30'
  if (amount < 60) return '30-60'
  if (amount < 100) return '60-100'
  return '100+'
}

export function getAgeGroup(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear
  if (age < 18) return 'under_18'
  if (age < 25) return '18-24'
  if (age < 35) return '25-34'
  if (age < 45) return '35-44'
  if (age < 55) return '45-54'
  return '55+'
}

// Only first 2 digits of Swiss PLZ — regional granularity, not precise location
export function getPostalPrefix(postalCode: string): string {
  return postalCode.replace(/\D/g, '').slice(0, 2)
}

export function getTimeBucket(time: string): string {
  const hour = parseInt(time.split(':')[0], 10)
  if (hour < 13) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

// Swiss-adjusted day of week: 0=Mon, 6=Sun
export function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr)
  const jsDay = d.getDay() // 0=Sun JS
  return jsDay === 0 ? 6 : jsDay - 1
}

export function getMonthYear(dateStr: string): string {
  return dateStr.slice(0, 7) // YYYY-MM
}

interface AnonymizedEventParams {
  eventType: 'booking_completed' | 'no_show' | 'cancellation'
  serviceCategory: string
  priceCHF: number
  date: string
  startTime: string
  postalCode?: string
  birthYear?: number
  analyticsConsent: boolean
  shopId?: string
  visitCount?: number        // total past bookings for this guest (for frequency bucket)
}

function getVisitFrequencyBucket(count: number): string {
  if (count <= 1) return 'first_time'
  if (count <= 4) return '2-4_per_year'
  if (count <= 12) return 'monthly'
  return 'biweekly_plus'
}

export async function recordAnonymizedEvent(
  supabase: SupabaseClient,
  params: AnonymizedEventParams
): Promise<void> {
  if (!params.analyticsConsent) return

  const event = {
    event_type: params.eventType,
    service_category: params.serviceCategory,
    spend_bucket: getSpendBucket(params.priceCHF),
    postal_prefix: params.postalCode ? getPostalPrefix(params.postalCode) : null,
    age_group: params.birthYear ? getAgeGroup(params.birthYear) : null,
    day_of_week: getDayOfWeek(params.date),
    time_bucket: getTimeBucket(params.startTime),
    month_year: getMonthYear(params.date),
    visit_frequency_bucket: params.visitCount != null
      ? getVisitFrequencyBucket(params.visitCount)
      : null,
    product_categories: [],
    shop_id: params.shopId ?? null,
  }

  await supabase.from('analytics_events').insert(event)
}
