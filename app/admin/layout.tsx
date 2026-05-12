import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Admin | Orient Barbershop' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (role?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-border md:flex">
        <div className="border-b border-border px-6 py-5">
          <p className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground">Admin</p>
          <p className="mt-0.5 text-sm font-black uppercase tracking-tight">Orient Barber</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {[
            { href: '/admin', label: 'Übersicht' },
            { href: '/admin/bookings', label: 'Buchungen' },
            { href: '/admin/analytics', label: 'Analytics' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border p-3">
          <Link
            href="/"
            className="block px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Website
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Mobile nav */}
        <div className="flex items-center gap-4 border-b border-border px-6 py-3 md:hidden">
          <p className="text-xs font-black uppercase tracking-tight">Orient Admin</p>
          <div className="ml-auto flex gap-4">
            {[
              { href: '/admin', label: 'Übersicht' },
              { href: '/admin/bookings', label: 'Buchungen' },
              { href: '/admin/analytics', label: 'Analytics' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
