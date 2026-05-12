'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Booking } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Bestätigt',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
  no_show: 'Nicht erschienen',
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-blue-600 bg-blue-500/10',
  completed: 'text-green-600 bg-green-500/10',
  cancelled: 'text-red-600 bg-red-500/10',
  no_show: 'text-yellow-600 bg-yellow-500/10',
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function AdminBookingsPage() {
  const [dateFrom, setDateFrom] = useState(todayStr())
  const [dateTo, setDateTo] = useState(todayStr())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings?from=${dateFrom}&to=${dateTo}`)
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchBookings()
    setUpdating(null)
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((s, b) => s + Number(b.price_chf ?? 0), 0)

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[4px] text-primary">Admin</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">Buchungen</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Von</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Bis</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
        <button
          onClick={fetchBookings}
          className="bg-foreground px-6 py-2 text-[11px] font-bold uppercase tracking-[2px] text-background hover:opacity-80"
        >
          Laden
        </button>
        {bookings.length > 0 && (
          <p className="ml-auto text-sm text-muted-foreground">
            {bookings.length} Buchung{bookings.length !== 1 ? 'en' : ''} ·{' '}
            <span className="font-bold text-foreground">CHF {totalRevenue.toFixed(0)}</span> abgeschlossen
          </p>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Wird geladen…</p>
      ) : bookings.length === 0 ? (
        <p className="border border-border py-12 text-center text-sm text-muted-foreground">
          Keine Buchungen in diesem Zeitraum.
        </p>
      ) : (
        <div className="border border-border">
          <div className="grid grid-cols-[80px_80px_1fr_120px_120px_120px_120px] border-b border-border bg-muted/30 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
            <span>Datum</span>
            <span>Zeit</span>
            <span>Kunde</span>
            <span>Service</span>
            <span>Barber</span>
            <span>Preis</span>
            <span>Status</span>
          </div>
          {bookings.map((b, i) => (
            <div
              key={b.id}
              className={`grid grid-cols-[80px_80px_1fr_120px_120px_120px_120px] items-center gap-0 px-4 py-3.5 text-sm ${
                i < bookings.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-xs text-muted-foreground">{b.booking_date}</span>
              <span className="font-mono text-xs font-bold">{b.start_time?.slice(0, 5)}</span>
              <div>
                <p className="font-semibold">
                  {b.guest_first_name} {b.guest_last_name}
                </p>
                <p className="text-[10px] text-muted-foreground">{b.guest_email}</p>
              </div>
              <span className="text-xs text-muted-foreground">{b.service_name}</span>
              <span className="text-xs text-muted-foreground">{b.barber_name}</span>
              <span className="text-xs font-bold">CHF {Number(b.price_chf ?? 0).toFixed(0)}</span>
              <select
                value={b.status}
                disabled={updating === b.id}
                onChange={e => updateStatus(b.id, e.target.value)}
                className={`border-0 bg-transparent text-[9px] font-bold uppercase tracking-wider outline-none ${STATUS_COLORS[b.status] ?? ''}`}
              >
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
