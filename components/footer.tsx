import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 px-8 py-10">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4">
        <span className="text-[11px] font-bold uppercase tracking-[4px] text-foreground/50">
          Orient Barber
        </span>

        <ul className="flex gap-8">
          <li>
            <Link
              href="#services"
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="#about"
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </li>
        </ul>

        <span className="text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} Orient Barbershop
        </span>
      </div>
    </footer>
  )
}
