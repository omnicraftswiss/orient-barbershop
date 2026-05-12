"use client"

import Link from "next/link"

export function BookingButton() {
  return (
    <>
      {/* Sticky Book Button - Desktop */}
      <Link
        href="/book"
        id="book"
        className="fixed bottom-8 right-8 z-50 hidden items-center gap-3 bg-foreground px-8 py-4 text-[11px] font-bold uppercase tracking-[2px] text-background shadow-xl shadow-foreground/20 transition-all hover:scale-105 hover:shadow-foreground/30 md:inline-flex"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Termin Buchen
      </Link>

      {/* Floating Book Button - Mobile */}
      <Link
        href="/book"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center bg-foreground text-background shadow-lg shadow-foreground/20 transition-transform hover:scale-110 md:hidden"
        aria-label="Termin buchen"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </Link>
    </>
  )
}
