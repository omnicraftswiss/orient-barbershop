"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, Scissors, UserCircle, CheckCircle2 } from "lucide-react";

const services = [
  "Haarschnitt",
  "Bart trimmen",
  "Haarschnitt + Bart",
  "Rasur",
  "Kinder Haarschnitt",
  "Augenbrauen",
];

const barbers = ["Kein Favorit", "Ahmad", "Hassan"];

export function AccountSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    preferredBarber: "",
    preferredService: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo:
          `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          preferred_barber: formData.preferredBarber,
          preferred_service: formData.preferredService,
          notes: formData.notes,
        },
      },
    });

    setIsLoading(false);

    if (signUpError) {
      const msg = signUpError.message ?? ''
      if (msg.includes('rate limit') || msg.includes('429') || msg.includes('security purposes')) {
        setError('Zu viele Versuche. Bitte warten Sie eine Minute und versuchen Sie es erneut.')
      } else if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.')
      } else if (msg.includes('invalid email') || msg.includes('Invalid email')) {
        setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      } else if (msg.includes('password') && msg.includes('6')) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.')
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
      }
      return;
    }

    setIsSuccess(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <section id="account" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-light tracking-tight text-foreground mb-4">
              Willkommen bei Orient Barbershop
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte überprüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="account" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">
              Mitglied werden
            </p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-6">
              Konto erstellen
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Erstellen Sie ein Konto, um schneller Termine zu buchen und Ihre Präferenzen zu speichern.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-primary" />
                Persönliche Daten
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-muted-foreground text-sm">
                    Vorname
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary h-12"
                      placeholder="Max"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-muted-foreground text-sm">
                    Nachname
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary h-12"
                      placeholder="Mustermann"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                Kontaktdaten
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground text-sm">
                    E-Mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary h-12"
                      placeholder="max@beispiel.ch"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-muted-foreground text-sm">
                    Telefon
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary h-12"
                      placeholder="+41 79 123 45 67"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground text-sm">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="bg-background border-border focus:border-primary h-12"
                  placeholder="Mindestens 6 Zeichen"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-3">
                <Scissors className="w-5 h-5 text-primary" />
                Präferenzen
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredService" className="text-muted-foreground text-sm">
                    Bevorzugte Dienstleistung
                  </Label>
                  <Select
                    value={formData.preferredService}
                    onValueChange={(value) => handleChange("preferredService", value)}
                  >
                    <SelectTrigger className="bg-background border-border focus:border-primary h-12">
                      <SelectValue placeholder="Dienstleistung wählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredBarber" className="text-muted-foreground text-sm">
                    Bevorzugter Barber
                  </Label>
                  <Select
                    value={formData.preferredBarber}
                    onValueChange={(value) => handleChange("preferredBarber", value)}
                  >
                    <SelectTrigger className="bg-background border-border focus:border-primary h-12">
                      <SelectValue placeholder="Barber wählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {barbers.map((barber) => (
                        <SelectItem key={barber} value={barber}>
                          {barber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-muted-foreground text-sm">
                  Anmerkungen (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="bg-background border-border focus:border-primary min-h-[100px] resize-none"
                  placeholder="Allergien, spezielle Wünsche, etc."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-base font-medium tracking-wide"
              >
                {isLoading ? "Wird erstellt..." : "Konto erstellen"}
              </Button>
              <p className="text-center text-muted-foreground text-sm mt-4">
                Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen zu.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
