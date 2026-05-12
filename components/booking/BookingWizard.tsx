'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Service, Barber } from '@/lib/types'

type Step = 'service' | 'barber' | 'datetime' | 'details'

interface BookingForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  postalCode: string
  birthYear: string
  termsAccepted: boolean
  analyticsConsent: boolean
}

const STEP_LABELS: Record<Step, string> = {
  service: 'Service',
  barber: 'Barber',
  datetime: 'Termin',
  details: 'Details',
}

const STEPS: Step[] = ['service', 'barber', 'datetime', 'details']

// ── Step indicator ──────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="mb-12 flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-7 w-7 items-center justify-center text-[10px] font-bold transition-colors ${
                i < idx
                  ? 'bg-primary text-primary-foreground'
                  : i === idx
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < idx ? '✓' : i + 1}
            </div>
            <span
              className={`text-[9px] font-semibold uppercase tracking-[1.5px] ${
                i === idx ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-3 mb-4 h-[1px] w-12 transition-colors ${
                i < idx ? 'bg-primary' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Booking confirmation (success state) ────────────────────────
function BookingConfirmation({
  bookingId, service, barber, date, time, firstName,
}: {
  bookingId: string
  service: Service
  barber: Barber
  date: Date
  time: string
  firstName: string
}) {
  return (
    <div className="mx-auto max-w-[520px] py-20 text-center">
      <div className="mb-8 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center border border-primary text-primary text-2xl">
          ✓
        </div>
      </div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[4px] text-primary">
        Buchung bestätigt
      </p>
      <h2 className="mb-8 text-3xl font-black uppercase leading-tight tracking-tight">
        Bis bald,
        <br />
        {firstName}!
      </h2>

      <div className="border border-border text-left">
        <div className="grid grid-cols-2 border-b border-border">
          <div className="border-r border-border px-6 py-5">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Service</p>
            <p className="text-sm font-semibold">{service.name}</p>
          </div>
          <div className="px-6 py-5">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Barber</p>
            <p className="text-sm font-semibold">{barber.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="border-r border-border px-6 py-5">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Datum</p>
            <p className="text-sm font-semibold">{format(date, 'EEEE, d. MMMM', { locale: de })}</p>
          </div>
          <div className="px-6 py-5">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Uhrzeit</p>
            <p className="text-sm font-semibold">{time} Uhr</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Buchungs-ID: <span className="font-mono text-xs">{bookingId.slice(0, 8).toUpperCase()}</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Gossau, Hauptstrasse · Mo–Sa 10:00–20:00 · +41 76 290 15 36
      </p>

      <a
        href="/"
        className="mt-10 inline-flex items-center gap-2 border border-border px-8 py-3.5 text-[11px] font-bold uppercase tracking-[2px] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
      >
        Zurück zur Startseite
      </a>
    </div>
  )
}

// ── Step 1: Service selection ───────────────────────────────────
function ServiceStep({
  services,
  selected,
  onSelect,
}: {
  services: Service[]
  selected: Service | null
  onSelect: (s: Service) => void
}) {
  return (
    <div>
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[4px] text-primary">Schritt 1</h2>
      <h3 className="mb-8 text-2xl font-black uppercase tracking-tight">Service wählen</h3>
      <div className="flex flex-col">
        {services.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`group grid grid-cols-[1fr_auto_auto] items-center gap-6 border-b border-border py-5 text-left transition-colors hover:bg-muted/30 ${
              i === 0 ? 'border-t border-border' : ''
            } ${selected?.id === s.id ? 'bg-muted/40' : ''}`}
          >
            <div>
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
            <p className="text-xs text-muted-foreground">{s.duration_minutes} Min</p>
            <p className="text-base font-bold">CHF {Number(s.price_chf).toFixed(0)}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Barber selection ────────────────────────────────────
function BarberStep({
  barbers,
  selected,
  onSelect,
  onBack,
}: {
  barbers: Barber[]
  selected: Barber | null
  onSelect: (b: Barber) => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[4px] text-primary">Schritt 2</h2>
      <h3 className="mb-8 text-2xl font-black uppercase tracking-tight">Barber wählen</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {barbers.map(b => (
          <button
            key={b.id}
            onClick={() => onSelect(b)}
            className={`border border-border p-6 text-left transition-colors hover:border-foreground ${
              selected?.id === b.id ? 'border-foreground bg-muted/30' : ''
            }`}
          >
            <div className="mb-4 h-14 w-14 overflow-hidden border border-border">
              {b.photo_url ? (
                <img src={b.photo_url} alt={b.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-black text-muted-foreground">
                  {b.name[0]}
                </div>
              )}
            </div>
            <p className="text-base font-black uppercase tracking-tight">{b.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{b.bio}</p>
            {b.specialties.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.specialties.map(sp => (
                  <span key={sp} className="border border-border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {sp}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
      <BackButton onClick={onBack} />
    </div>
  )
}

// ── Step 3: Date + time slot ────────────────────────────────────
const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function DateTimeStep({
  service,
  barber,
  selectedDate,
  onDateSelect,
  slots,
  loadingSlots,
  selectedTime,
  onTimeSelect,
  onNext,
  onBack,
}: {
  service: Service
  barber: Barber
  selectedDate: Date | null
  onDateSelect: (d: Date) => void
  slots: string[]
  loadingSlots: boolean
  selectedTime: string | null
  onTimeSelect: (t: string) => void
  onNext: () => void
  onBack: () => void
}) {
  // Next 30 days excluding Sundays
  const availableDates = Array.from({ length: 35 }, (_, i) => addDays(new Date(), i + 1))
    .filter(d => d.getDay() !== 0)
    .slice(0, 30)

  return (
    <div>
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[4px] text-primary">Schritt 3</h2>
      <h3 className="mb-8 text-2xl font-black uppercase tracking-tight">Datum & Uhrzeit</h3>

      {/* Date picker */}
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground">Datum</p>
      <div className="mb-8 grid grid-cols-5 gap-2 sm:grid-cols-7">
        {availableDates.map(d => {
          const isSelected = selectedDate && format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          const jsDay = d.getDay()
          const dayIdx = jsDay === 0 ? 6 : jsDay - 1
          return (
            <button
              key={d.toISOString()}
              onClick={() => onDateSelect(d)}
              className={`flex flex-col items-center gap-0.5 border py-3 text-center transition-colors ${
                isSelected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground'
              }`}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">
                {DAY_NAMES[dayIdx]}
              </span>
              <span className="text-sm font-black">{format(d, 'd')}</span>
              <span className="text-[9px] opacity-60">{format(d, 'MMM', { locale: de })}</span>
            </button>
          )
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground">Uhrzeit</p>
          {loadingSlots ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <span className="animate-spin">◌</span> Verfügbarkeit wird geladen...
            </div>
          ) : slots.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Keine freien Termine an diesem Tag. Bitte wählen Sie ein anderes Datum.
            </p>
          ) : (
            <div className="mb-8 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => onTimeSelect(slot)}
                  className={`border py-2.5 text-center text-sm font-semibold transition-colors ${
                    selectedTime === slot
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between">
        <BackButton onClick={onBack} />
        <button
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className="bg-primary px-8 py-3.5 text-[11px] font-bold uppercase tracking-[2px] text-primary-foreground transition-opacity disabled:opacity-30 hover:opacity-85"
        >
          Weiter →
        </button>
      </div>
    </div>
  )
}

// ── Step 4: Customer details + consent ─────────────────────────
function DetailsStep({
  form,
  onChange,
  onSubmit,
  onBack,
  submitting,
  error,
  service,
  barber,
  date,
  time,
}: {
  form: BookingForm
  onChange: (f: BookingForm) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
  error: string | null
  service: Service
  barber: Barber
  date: Date
  time: string
}) {
  const set = (key: keyof BookingForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <div>
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[4px] text-primary">Schritt 4</h2>
      <h3 className="mb-8 text-2xl font-black uppercase tracking-tight">Ihre Daten</h3>

      {/* Summary */}
      <div className="mb-8 border border-border">
        <div className="grid grid-cols-2 border-b border-border text-sm">
          <div className="border-r border-border px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Service</p>
            <p className="mt-0.5 font-semibold">{service.name}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Barber</p>
            <p className="mt-0.5 font-semibold">{barber.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 text-sm">
          <div className="border-r border-border px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Datum</p>
            <p className="mt-0.5 font-semibold">{format(date, 'EEEE, d. MMMM', { locale: de })}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-muted-foreground">Uhrzeit · Preis</p>
            <p className="mt-0.5 font-semibold">{time} Uhr · CHF {Number(service.price_chf).toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname *" value={form.firstName} onChange={set('firstName')} placeholder="Max" required />
        <Field label="Nachname *" value={form.lastName} onChange={set('lastName')} placeholder="Mustermann" required />
        <Field label="E-Mail *" type="email" value={form.email} onChange={set('email')} placeholder="max@beispiel.ch" required />
        <Field label="Telefon" type="tel" value={form.phone} onChange={set('phone')} placeholder="+41 79 123 45 67" />
        <Field
          label="Postleitzahl (PLZ)"
          value={form.postalCode}
          onChange={set('postalCode')}
          placeholder="9200"
          maxLength={4}
          hint="Wird für lokale Marktanalysen verwendet, falls Sie unten zustimmen."
        />
        <Field
          label="Geburtsjahr"
          type="number"
          value={form.birthYear}
          onChange={set('birthYear')}
          placeholder="1990"
          min="1920"
          max={new Date().getFullYear() - 10}
          hint="Für Altersgruppen-Auswertung, falls Sie unten zustimmen."
        />
      </div>

      {/* Consent */}
      <div className="mt-8 space-y-4 border-t border-border pt-6">
        <ConsentBox
          id="terms"
          checked={form.termsAccepted}
          onChange={e => onChange({ ...form, termsAccepted: e.target.checked })}
          required
          label={
            <>
              Ich akzeptiere die{' '}
              <a href="/datenschutz" className="underline hover:text-primary">Datenschutzerklärung</a>{' '}
              und die{' '}
              <a href="/agb" className="underline hover:text-primary">Nutzungsbedingungen</a>.{' '}
              <span className="text-primary">*</span>
            </>
          }
        />
        <ConsentBox
          id="analytics"
          checked={form.analyticsConsent}
          onChange={e => onChange({ ...form, analyticsConsent: e.target.checked })}
          label={
            <>
              <span className="font-semibold">Optional:</span> Ich bin einverstanden, dass meine anonymisierten Besuchsdaten (Besuchshäufigkeit, Ausgabenbereich, Servicekategorie, PLZ-Prefix) für Marktforschungszwecke an kommerzielle Partner weitergegeben werden. Es werden <span className="font-semibold">keine persönlichen Angaben</span> (Name, E-Mail, Telefon) weitergegeben. Ich kann diese Einwilligung jederzeit widerrufen.
            </>
          }
        />
      </div>

      {error && (
        <p className="mt-4 border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <BackButton onClick={onBack} />
        <button
          onClick={onSubmit}
          disabled={submitting || !form.termsAccepted || !form.firstName || !form.email}
          className="bg-primary px-8 py-3.5 text-[11px] font-bold uppercase tracking-[2px] text-primary-foreground transition-opacity disabled:opacity-30 hover:opacity-85"
        >
          {submitting ? 'Wird gebucht…' : 'Jetzt buchen →'}
        </button>
      </div>
    </div>
  )
}

// ── Shared UI atoms ────────────────────────────────────────────
function Field({
  label, value, onChange, type = 'text', placeholder, required, maxLength, min, max, hint,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  required?: boolean
  maxLength?: number
  min?: string | number
  max?: string | number
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        className="border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ConsentBox({
  id, checked, onChange, label, required,
}: {
  id: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: React.ReactNode
  required?: boolean
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required={required}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      />
      <span className="text-xs leading-relaxed text-muted-foreground">{label}</span>
    </label>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground transition-colors hover:text-foreground"
    >
      ← Zurück
    </button>
  )
}

// ── Main wizard ────────────────────────────────────────────────
export function BookingWizard({ services, barbers }: { services: Service[]; barbers: Barber[] }) {
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState<BookingForm>({
    firstName: '', lastName: '', email: '', phone: '',
    postalCode: '', birthYear: '',
    termsAccepted: false, analyticsConsent: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const fetchSlots = useCallback(async () => {
    if (!selectedBarber || !selectedDate || !selectedService) return
    setLoadingSlots(true)
    setSelectedTime(null)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(
        `/api/availability?barberId=${selectedBarber.id}&date=${dateStr}&duration=${selectedService.duration_minutes}`
      )
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [selectedBarber, selectedDate, selectedService])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const handleSubmit = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          barberId: selectedBarber.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          postalCode: form.postalCode,
          birthYear: form.birthYear,
          analyticsConsent: form.analyticsConsent,
          marketingConsent: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return
      }
      setBookingId(data.bookingId)
    } catch {
      setError('Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.')
    } finally {
      setSubmitting(false)
    }
  }

  if (bookingId && selectedService && selectedBarber && selectedDate && selectedTime) {
    return (
      <BookingConfirmation
        bookingId={bookingId}
        service={selectedService}
        barber={selectedBarber}
        date={selectedDate}
        time={selectedTime}
        firstName={form.firstName}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[700px] px-8 py-16">
      <StepIndicator current={step} />

      {step === 'service' && (
        <ServiceStep
          services={services}
          selected={selectedService}
          onSelect={s => { setSelectedService(s); setStep('barber') }}
        />
      )}
      {step === 'barber' && (
        <BarberStep
          barbers={barbers}
          selected={selectedBarber}
          onSelect={b => { setSelectedBarber(b); setStep('datetime') }}
          onBack={() => setStep('service')}
        />
      )}
      {step === 'datetime' && selectedService && selectedBarber && (
        <DateTimeStep
          service={selectedService}
          barber={selectedBarber}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          slots={slots}
          loadingSlots={loadingSlots}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          onNext={() => setStep('details')}
          onBack={() => setStep('barber')}
        />
      )}
      {step === 'details' && selectedService && selectedBarber && selectedDate && selectedTime && (
        <DetailsStep
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onBack={() => setStep('datetime')}
          submitting={submitting}
          error={error}
          service={selectedService}
          barber={selectedBarber}
          date={selectedDate}
          time={selectedTime}
        />
      )}
    </div>
  )
}
