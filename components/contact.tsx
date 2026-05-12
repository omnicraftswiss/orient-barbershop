const hours = [
  { day: "Montag", time: "10:00 - 20:00" },
  { day: "Dienstag", time: "10:00 - 20:00" },
  { day: "Mittwoch", time: "10:00 - 20:00" },
  { day: "Donnerstag", time: "10:00 - 20:00" },
  { day: "Freitag", time: "10:00 - 20:00" },
  { day: "Samstag", time: "10:00 - 20:00" },
  { day: "Sonntag", time: "Geschlossen", closed: true },
]

export function Contact() {
  // Get current day (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay()
  // Convert to our array index (Monday = 0 in our array)
  const todayIndex = today === 0 ? 6 : today - 1

  return (
    <section id="contact" className="border-t border-border py-28">
      <div className="mx-auto max-w-[1100px] px-8">
        <div className="mb-16">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[4px] text-primary">
            Kontakt
          </p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold uppercase leading-tight tracking-[-1.5px]">
            Besuchen Sie Uns
          </h2>
        </div>

        <div className="grid gap-24 md:grid-cols-2">
          {/* Hours */}
          <div className="flex flex-col">
            {hours.map((item, index) => (
              <div
                key={item.day}
                className={`flex items-center justify-between py-3.5 text-sm ${
                  index === 0 ? "border-t border-border" : ""
                } border-b border-border ${
                  index === todayIndex ? "font-semibold" : ""
                }`}
              >
                <span
                  className={
                    index === todayIndex
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {item.day}
                </span>
                <span
                  className={
                    item.closed
                      ? "font-normal text-muted-foreground"
                      : index === todayIndex
                        ? "text-primary"
                        : "font-semibold"
                  }
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col">
            <a
              href="https://maps.google.com/?q=St.+Gallerstrasse+62,+9200+Gossau"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border-t border-b border-border py-5 transition-colors hover:bg-secondary/50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[2.5px] text-primary">
                  Adresse
                </span>
                <span className="text-[15px] font-light text-muted-foreground transition-colors group-hover:text-foreground">
                  St. Gallerstrasse 62, 9200 Gossau
                </span>
              </div>
              <span className="text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">&rarr;</span>
            </a>

            <a
              href="tel:+41762901536"
              className="group flex items-center justify-between border-b border-border py-5 transition-colors hover:bg-secondary/50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[2.5px] text-primary">
                  Telefon
                </span>
                <span className="text-[15px] font-light text-muted-foreground transition-colors group-hover:text-foreground">
                  +41 76 290 15 36
                </span>
              </div>
              <span className="text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">&rarr;</span>
            </a>

            <a
              href="mailto:info@orientbarbershop.ch"
              className="group flex items-center justify-between border-b border-border py-5 transition-colors hover:bg-secondary/50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[2.5px] text-primary">
                  E-Mail
                </span>
                <span className="text-[15px] font-light text-muted-foreground transition-colors group-hover:text-foreground">
                  info@orientbarbershop.ch
                </span>
              </div>
              <span className="text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">&rarr;</span>
            </a>

            {/* Map */}
            <div className="mt-8 h-56 overflow-hidden bg-secondary shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2707.8!2d9.25!3d47.416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI0JzU3LjYiTiA5wrAxNScwMC4wIkU!5e0!3m2!1sen!2sch!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "sepia(20%) contrast(1.05) brightness(0.97)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Orient Barbershop Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
