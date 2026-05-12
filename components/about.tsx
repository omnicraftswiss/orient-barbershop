export function About() {
  return (
    <section id="about" className="border-t border-border py-28">
      <div className="mx-auto max-w-[1100px] px-8">
        <div className="grid items-center gap-24 md:grid-cols-2">
          {/* Image */}
          <div className="group relative aspect-[3/4] w-full overflow-hidden bg-secondary shadow-lg">
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('/images/barber.jpg')`,
                filter: "sepia(15%) contrast(1.05)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
          </div>

          {/* Text */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[4px] text-primary">
              Über Uns
            </p>
            <h2 className="mb-8 text-[clamp(2rem,4vw,3.2rem)] font-extrabold uppercase leading-tight tracking-[-1.5px]">
              Tradition &
              <br />
              Handwerk
            </h2>

            <div className="flex flex-col gap-4">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Orient Barbershop vereint traditionelles Handwerk mit modernem
                Stil. Unser erfahrenes Team bietet Ihnen erstklassige
                Haarschnitte und Bartpflege in entspannter Atmosphäre.
              </p>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Mit Leidenschaft und Präzision kümmern wir uns um Ihren Look.
                Jeder Kunde verlässt unseren Shop mit einem Lächeln.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {[
                "Präzision",
                "Qualität",
                "Erfahrung",
                "Stil",
                "Beratung",
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary px-4 py-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
