"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex h-16 items-center px-8 transition-all duration-500 ${
          isScrolled
            ? "border-b border-border bg-background/95 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-[4px] text-foreground"
        >
          Orient Barber
        </Link>

        <ul className="ml-auto hidden items-center gap-10 md:flex">
          <li>
            <Link
              href="#services"
              className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="#about"
              className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="#account"
              className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Account
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/book"
              className="bg-foreground px-5 py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-background transition-opacity hover:opacity-75"
            >
              Buchen
            </Link>
          </li>
        </ul>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="ml-auto flex flex-col gap-1.5 p-1 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-[1.5px] w-5 bg-foreground transition-all duration-300 ${
              isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-foreground transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-foreground transition-all duration-300 ${
              isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-x-0 top-16 z-40 flex-col border-t border-border bg-background p-10 md:hidden ${
          isMobileMenuOpen ? "flex" : "hidden"
        }`}
      >
        <Link
          href="#services"
          onClick={() => setIsMobileMenuOpen(false)}
          className="border-b border-border py-4 text-2xl font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
        >
          Services
        </Link>
        <Link
          href="#about"
          onClick={() => setIsMobileMenuOpen(false)}
          className="border-b border-border py-4 text-2xl font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
        >
          About
        </Link>
        <Link
          href="#account"
          onClick={() => setIsMobileMenuOpen(false)}
          className="border-b border-border py-4 text-2xl font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
        >
          Account
        </Link>
        <Link
          href="#contact"
          onClick={() => setIsMobileMenuOpen(false)}
          className="border-b border-border py-4 text-2xl font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
        >
          Contact
        </Link>
        <Link
          href="/book"
          onClick={() => setIsMobileMenuOpen(false)}
          className="py-4 text-2xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          Book Now
        </Link>
      </div>
    </>
  )
}
