import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { About } from "@/components/about"
import { AccountSection } from "@/components/account-section"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { BookingButton } from "@/components/booking-button"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <Hero />
      <Services />
      <About />
      <AccountSection />
      <Contact />
      <Footer />
      <BookingButton />
    </main>
  )
}
