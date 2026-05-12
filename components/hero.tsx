import Link from "next/link"

export function Hero() {
  return (
    <section
      id="hero"
      className="relative grid min-h-screen grid-rows-[1fr_auto] pt-16"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-bg.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/75 to-background" />
      </div>

      <div className="mx-auto flex w-full max-w-[1100px] flex-col justify-center px-8 pb-8 pt-16">
        <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[4px] text-primary">
          <span className="block h-px w-8 bg-primary" />
          Premium Barbershop · Gossau
        </p>

        <h1 className="mb-8 text-[clamp(3.8rem,11vw,10rem)] font-black uppercase leading-[0.95] tracking-[-3px]">
          Orient
          <br />
          <span className="text-foreground/30">Barber</span>
        </h1>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-xs text-[15px] font-light leading-relaxed text-foreground/60">
            Meisterhafte Haarschnitte und Bartpflege in Gossau. Tradition trifft
            auf modernen Stil.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/book"
              className="inline-flex items-center gap-2.5 bg-foreground px-8 py-3.5 text-[11px] font-bold uppercase tracking-[2px] text-background transition-opacity hover:opacity-80"
            >
              Termin Buchen
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="#services"
              className="border-b border-foreground/25 pb-0.5 text-[11px] font-semibold uppercase tracking-[2px] text-foreground/50 transition-colors hover:border-foreground/60 hover:text-foreground"
            >
              Services
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 border-t border-border bg-background/70 backdrop-blur-sm">
        <div className="border-r border-border px-8 py-6">
          <p className="text-3xl font-black tracking-tight text-primary">10+</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[2px] text-muted-foreground">
            Jahre Erfahrung
          </p>
        </div>
        <div className="border-r border-border px-8 py-6">
          <p className="text-3xl font-black tracking-tight text-primary">5.0</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[2px] text-muted-foreground">
            Google Bewertung
          </p>
        </div>
        <div className="px-8 py-6">
          <p className="text-2xl font-black tracking-tight text-primary">Mo–Sa</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[2px] text-muted-foreground">
            10:00 – 20:00 Uhr
          </p>
        </div>
      </div>
    </section>
  )
}
