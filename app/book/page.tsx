import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { BookingWizard } from '@/components/booking/BookingWizard'
import type { Service, Barber } from '@/lib/types'

export const metadata = {
  title: 'Termin buchen | Orient Barbershop Gossau',
  description: 'Jetzt online Termin buchen bei Orient Barbershop in Gossau.',
}

export default async function BookPage() {
  const supabase = await createClient()

  const [{ data: servicesData }, { data: barbersData }] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('barbers')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
  ])

  const services: Service[] = servicesData ?? []
  const barbers: Barber[] = barbersData ?? []

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-[700px] px-8 py-14">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[4px] text-primary">
              Orient Barbershop · Gossau
            </p>
            <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-[-2px]">
              Termin
              <br />
              <span className="text-muted-foreground">Buchen</span>
            </h1>
          </div>
        </div>

        {services.length === 0 || barbers.length === 0 ? (
          <div className="mx-auto max-w-[700px] px-8 py-20 text-center">
            <p className="text-muted-foreground">
              Das Online-Buchungssystem wird gerade eingerichtet.
              <br />
              Bitte buchen Sie per WhatsApp:{' '}
              <a
                href="https://wa.me/41762901536"
                className="text-primary underline"
              >
                +41 76 290 15 36
              </a>
            </p>
          </div>
        ) : (
          <BookingWizard services={services} barbers={barbers} />
        )}
      </div>
    </main>
  )
}
