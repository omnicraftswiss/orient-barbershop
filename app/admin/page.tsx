import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-border p-6">
      <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default async function AdminPage() {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: todayBookings },
    { data: weekBookings },
    { data: totalCustomers },
    { data: pendingBookings },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, guest_first_name, guest_last_name, start_time, service_name, barber_name, status, price_chf')
      .eq('booking_date', today)
      .order('start_time'),
    supabase
      .from('bookings')
      .select('price_chf, status')
      .gte('booking_date', today)
      .lte('booking_date', new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10))
      .eq('status', 'confirmed'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('booking_date', today)
      .eq('status', 'confirmed'),
  ])

  const todayRevenue = (todayBookings ?? [])
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.price_chf ?? 0), 0)

  const weekRevenuePotential = (weekBookings ?? [])
    .reduce((sum, b) => sum + Number(b.price_chf ?? 0), 0)

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[4px] text-primary">Dashboard</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">Übersicht</h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Heute (bestätigt)" value={String(pendingBookings?.length ?? 0)} sub="Termine" />
        <Stat label="Heute (Umsatz)" value={`CHF ${todayRevenue.toFixed(0)}`} sub="abgeschlossen" />
        <Stat label="Diese Woche" value={String(weekBookings?.length ?? 0)} sub="Buchungen" />
        <Stat label="Woche (Potenzial)" value={`CHF ${weekRevenuePotential.toFixed(0)}`} sub="bei Completion" />
      </div>

      {/* Today's bookings */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground">Heutige Termine</h2>
        <Link href="/admin/bookings" className="text-[10px] font-semibold uppercase tracking-wider text-primary hover:underline">
          Alle →
        </Link>
      </div>

      {(todayBookings ?? []).length === 0 ? (
        <p className="border border-border px-6 py-8 text-center text-sm text-muted-foreground">
          Keine Buchungen für heute.
        </p>
      ) : (
        <div className="border border-border">
          {(todayBookings ?? []).map((b, i) => (
            <div
              key={b.id}
              className={`grid grid-cols-[4rem_1fr_1fr_auto] items-center gap-4 px-6 py-4 text-sm ${
                i < (todayBookings ?? []).length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="font-mono text-xs font-bold">{b.start_time?.slice(0, 5)}</span>
              <span className="font-semibold">
                {b.guest_first_name} {b.guest_last_name}
              </span>
              <span className="text-muted-foreground">{b.service_name} · {b.barber_name}</span>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-blue-500/10 text-blue-600',
    completed: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-600',
    no_show: 'bg-yellow-500/10 text-yellow-600',
  }
  const labels: Record<string, string> = {
    confirmed: 'Bestätigt',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    no_show: 'Nicht erschienen',
  }
  return (
    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${styles[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  )
}
