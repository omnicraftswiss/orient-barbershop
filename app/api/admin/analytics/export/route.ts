import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/analytics/export?from=YYYY-MM&to=YYYY-MM&format=json|csv
// Returns aggregated anonymized data for B2B resale.
// Enforces k-anonymity: buckets with fewer than 5 records are suppressed.
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  // Auth guard
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
  const from = searchParams.get('from') ?? new Date().toISOString().slice(0, 7)
  const to = searchParams.get('to') ?? from
  const format = searchParams.get('format') ?? 'json'

  // Fetch raw events in date range
  const { data: events, error } = await db
    .from('analytics_events')
    .select('*')
    .gte('month_year', from)
    .lte('month_year', to)
    .eq('event_type', 'booking_completed')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate: group by postal_prefix + service_category + spend_bucket + age_group
  const groups: Record<string, {
    postal_prefix: string | null
    service_category: string | null
    spend_bucket: string | null
    age_group: string | null
    day_of_week_distribution: number[]
    time_bucket_distribution: Record<string, number>
    visit_frequency_distribution: Record<string, number>
    count: number
  }> = {}

  for (const e of events ?? []) {
    const key = [e.postal_prefix, e.service_category, e.spend_bucket, e.age_group].join('|')
    if (!groups[key]) {
      groups[key] = {
        postal_prefix: e.postal_prefix,
        service_category: e.service_category,
        spend_bucket: e.spend_bucket,
        age_group: e.age_group,
        day_of_week_distribution: Array(7).fill(0),
        time_bucket_distribution: { morning: 0, afternoon: 0, evening: 0 },
        visit_frequency_distribution: {},
        count: 0,
      }
    }
    const g = groups[key]
    g.count++
    if (e.day_of_week != null) g.day_of_week_distribution[e.day_of_week]++
    if (e.time_bucket) g.time_bucket_distribution[e.time_bucket] = (g.time_bucket_distribution[e.time_bucket] ?? 0) + 1
    if (e.visit_frequency_bucket) {
      g.visit_frequency_distribution[e.visit_frequency_bucket] = (g.visit_frequency_distribution[e.visit_frequency_bucket] ?? 0) + 1
    }
  }

  // k-anonymity: suppress any group with fewer than 5 records
  const K_THRESHOLD = 5
  const exportData = Object.values(groups)
    .filter(g => g.count >= K_THRESHOLD)
    .map(g => ({
      postal_prefix: g.postal_prefix,
      service_category: g.service_category,
      spend_bucket: g.spend_bucket,
      age_group: g.age_group,
      record_count: g.count,
      peak_days: g.day_of_week_distribution
        .map((c, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], count: c }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      time_bucket_distribution: g.time_bucket_distribution,
      visit_frequency_distribution: g.visit_frequency_distribution,
      period_from: from,
      period_to: to,
    }))

  if (format === 'csv') {
    const headers = [
      'postal_prefix','service_category','spend_bucket','age_group',
      'record_count','period_from','period_to'
    ]
    const rows = exportData.map(r => [
      r.postal_prefix ?? '',
      r.service_category ?? '',
      r.spend_bucket ?? '',
      r.age_group ?? '',
      r.record_count,
      r.period_from,
      r.period_to,
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics_${from}_${to}.csv"`,
      }
    })
  }

  return NextResponse.json({
    metadata: {
      period_from: from,
      period_to: to,
      total_events: events?.length ?? 0,
      exported_groups: exportData.length,
      k_threshold: K_THRESHOLD,
      note: `Groups with fewer than ${K_THRESHOLD} records are suppressed for privacy.`,
    },
    data: exportData,
  })
}
