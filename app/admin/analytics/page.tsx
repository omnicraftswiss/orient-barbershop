import { createAdminClient } from '@/lib/supabase/admin'

interface AggRow {
  service_category: string | null
  spend_bucket: string | null
  postal_prefix: string | null
  age_group: string | null
  day_of_week: number | null
  time_bucket: string | null
  month_year: string | null
}

const SPEND_ORDER = ['<30', '30-60', '60-100', '100+']
const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function countBy<T>(arr: T[], key: (v: T) => string | null): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, v) => {
    const k = key(v) ?? 'unbekannt'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})
}

function BarChart({ data, maxLabel }: { data: Record<string, number>; maxLabel?: number }) {
  const max = maxLabel ?? Math.max(1, ...Object.values(data))
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1])
  return (
    <div className="space-y-2">
      {sorted.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3 text-xs">
          <span className="w-20 shrink-0 text-right text-muted-foreground">{label}</span>
          <div className="flex-1 bg-muted">
            <div
              className="h-5 bg-primary transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right font-bold">{count}</span>
        </div>
      ))}
    </div>
  )
}

export default async function AdminAnalyticsPage() {
  const db = createAdminClient()

  // Last 12 months of consented events
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  const fromMonth = twelveMonthsAgo.toISOString().slice(0, 7)

  const { data: events } = await db
    .from('analytics_events')
    .select('service_category,spend_bucket,postal_prefix,age_group,day_of_week,time_bucket,month_year')
    .gte('month_year', fromMonth)
    .eq('event_type', 'booking_completed')

  const rows: AggRow[] = events ?? []
  const total = rows.length

  const byService = countBy(rows, r => r.service_category)
  const bySpend = countBy(rows, r => r.spend_bucket)
  const byDay = countBy(rows, r => r.day_of_week != null ? DAY_NAMES[r.day_of_week] : null)
  const byTime = countBy(rows, r => r.time_bucket)
  const byPostal = countBy(rows, r => r.postal_prefix ? `PLZ ${r.postal_prefix}xx` : null)
  const byAge = countBy(rows, r => r.age_group)
  const byMonth = countBy(rows, r => r.month_year)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const prevMonth = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 7)
  })()
  const thisMonthCount = byMonth[currentMonth] ?? 0
  const lastMonthCount = byMonth[prevMonth] ?? 0
  const growth = lastMonthCount === 0 ? null : ((thisMonthCount - lastMonthCount) / lastMonthCount * 100).toFixed(0)

  // Top spend category for headline
  const topSpend = Object.entries(bySpend).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[4px] text-primary">Admin</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">Analytics</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Nur anonymisierte Daten von Kunden mit Einwilligung · {total} Datenpunkte (letzte 12 Monate)
        </p>
      </div>

      {/* Export button */}
      <div className="mb-8">
        <a
          href={`/api/admin/analytics/export?from=${fromMonth}&to=${currentMonth}&format=json`}
          className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[2px] transition-colors hover:border-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          Export JSON →
        </a>
        <a
          href={`/api/admin/analytics/export?from=${fromMonth}&to=${currentMonth}&format=csv`}
          className="ml-3 inline-flex items-center gap-2 border border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[2px] transition-colors hover:border-foreground"
        >
          Export CSV →
        </a>
      </div>

      {total === 0 ? (
        <div className="border border-border px-8 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Noch keine Analytics-Daten vorhanden.
            <br />
            Daten erscheinen hier, sobald Kunden der anonymisierten Auswertung zugestimmt haben.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="border border-border p-5">
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Dieser Monat</p>
              <p className="mt-2 text-3xl font-black">{thisMonthCount}</p>
              {growth !== null && (
                <p className={`mt-1 text-xs font-semibold ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(growth) >= 0 ? '+' : ''}{growth}% vs. Vormonat
                </p>
              )}
            </div>
            <div className="border border-border p-5">
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Top Ausgabenklasse</p>
              <p className="mt-2 text-3xl font-black">CHF {topSpend}</p>
              <p className="mt-1 text-xs text-muted-foreground">häufigste Kategorie</p>
            </div>
            <div className="border border-border p-5">
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Einwilligungsrate</p>
              <p className="mt-2 text-3xl font-black">{total}</p>
              <p className="mt-1 text-xs text-muted-foreground">Datenpunkte gesamt</p>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Service-Kategorien">
              <BarChart data={byService} />
            </ChartCard>
            <ChartCard title="Ausgabenverteilung (CHF)">
              <BarChart
                data={Object.fromEntries(
                  SPEND_ORDER.filter(k => bySpend[k]).map(k => [k, bySpend[k]])
                )}
              />
            </ChartCard>
            <ChartCard title="Wochentag-Verteilung">
              <BarChart data={byDay} />
            </ChartCard>
            <ChartCard title="Tageszeit-Verteilung">
              <BarChart data={byTime} />
            </ChartCard>
            {Object.keys(byPostal).length > 0 && (
              <ChartCard title="Regionen (PLZ-Prefix)">
                <BarChart data={byPostal} />
              </ChartCard>
            )}
            {Object.keys(byAge).length > 0 && (
              <ChartCard title="Altersgruppen">
                <BarChart data={byAge} />
              </ChartCard>
            )}
          </div>

          <div className="mt-8 border border-border px-6 py-4 text-xs text-muted-foreground">
            <strong>Datenschutzhinweis:</strong> Diese Auswertungen basieren ausschliesslich auf anonymisierten Daten von
            Kunden, die der Datenverwendung zugestimmt haben. Kein Datenpunkt enthält persönliche Informationen
            (Name, E-Mail, Telefon). Der Export unterliegt k-Anonymität (min. 5 Datenpunkte pro Gruppe).
            Alle Datenverwendungen erfolgen gemäss Schweizer revFADP / DSGVO.
          </div>
        </>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border p-6">
      <p className="mb-5 text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}
