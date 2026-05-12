const services = [
  {
    id: "01",
    name: "Haarschnitt",
    detail: "Klassisch oder modern",
    price: "CHF 35",
  },
  {
    id: "02",
    name: "Bart Trimmen",
    detail: "Pflege & Styling",
    price: "CHF 20",
  },
  {
    id: "03",
    name: "Haarschnitt & Bart",
    detail: "Komplett-Service",
    price: "CHF 50",
  },
  {
    id: "04",
    name: "Kinder Haarschnitt",
    detail: "Bis 12 Jahre",
    price: "CHF 25",
  },
  {
    id: "05",
    name: "Rasur",
    detail: "Traditionelle Nassrasur",
    price: "CHF 30",
  },
  {
    id: "06",
    name: "Augenbrauen",
    detail: "Formen & Pflegen",
    price: "CHF 10",
  },
]

export function Services() {
  return (
    <section id="services" className="border-t border-border py-28">
      <div className="mx-auto max-w-[1100px] px-8">
        {/* Header */}
        <div className="mb-16 grid items-end gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[4px] text-primary">
              Services & Preise
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold uppercase leading-tight tracking-[-1.5px]">
              Unsere
              <br />
              Dienstleistungen
            </h2>
          </div>
          <p className="max-w-sm self-end text-sm leading-relaxed text-muted-foreground">
            Qualität und Präzision bei jedem Schnitt. Wir verwenden nur
            hochwertige Produkte für ein perfektes Ergebnis.
          </p>
        </div>

        {/* Services List */}
        <div className="flex flex-col">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`group grid cursor-default grid-cols-[2.5rem_1fr_auto_auto] items-center gap-6 py-5 transition-all hover:bg-secondary/60 hover:px-4 ${
                index === 0 ? "border-t border-border" : ""
              } border-b border-border`}
            >
              <span className="text-[10px] font-bold tracking-wider text-primary/50 transition-colors group-hover:text-primary">
                {service.id}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold tracking-tight">
                  {service.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {service.detail}
                </span>
              </div>
              <span className="text-right text-base font-bold text-primary">
                {service.price}
              </span>
              <span className="text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                &rarr;
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
