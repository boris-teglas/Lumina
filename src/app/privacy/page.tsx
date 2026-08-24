'use client'

import Link from 'next/link'
import { Sparkles, ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="glass-panel" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo-brand" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} style={{ color: 'var(--primary)' }} /> GlowLink
          </Link>
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', gap: '6px' }}>
            <ArrowLeft size={16} /> Nazad na početnu
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container animate-fade-in" style={{ flex: 1, padding: '60px 24px', maxWidth: '850px' }}>
        <div className="glass-panel" style={{ padding: '40px 32px', borderRadius: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Politika Privatnosti</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Poslednje ažuriranje: {new Date().toLocaleDateString('sr-RS')}</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} style={{ color: 'var(--primary)' }} /> 1. Opšte informacije i ko prikuplja podatke
              </h2>
              <p>
                Ova Politika privatnosti objašnjava kako <strong>GlowLink</strong> (platforma za zakazivanje salona lepote) prikuplja, koristi i štiti lične podatke posetilaca, vlasnika salona i klijenata. 
                Poštujemo vašu privatnost i posvećeni smo zaštiti vaših ličnih podataka u skladu sa važećim zakonima o zaštiti podataka o ličnosti (GDPR i Zakon o zaštiti podataka o ličnosti Republike Srbije).
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} /> 2. Koje podatke prikupljamo
              </h2>
              <p>Prikupljamo samo neophodne podatke u cilju pružanja usluga zakazivanja termina:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Podaci vlasnika salona:</strong> Ime i prezime, e-mail adresa, naziv salona, kontakt telefon, radno vreme i cenovnik usluga.</li>
                <li><strong>Podaci klijenata koji zakazuju termine:</strong> Ime i prezime, broj telefona, e-mail adresa i izabrana usluga i termin.</li>
                <li><strong>Tehnički podaci i kolačići (Cookies):</strong> IP adresa, tip pregledača i sesioni kolačići neophodni za rad prijave i bezbednost.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} style={{ color: 'var(--primary)' }} /> 3. Svrha obrade i treće strane
              </h2>
              <p>Vaši podaci se koriste isključivo za:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Omogućavanje online zakazivanja termina u izabranom salonu.</li>
                <li>Slanje e-mail i SMS obaveštenja i podsetnika o zakazanim terminima.</li>
                <li>Procesuiranje naplate pretplate putem licenciranih globalnih procesora plaćanja.</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                <strong>Treće strane:</strong> Ne prodajemo i ne iznajmljujemo lične podatke. Podatke delimo isključivo sa pouzdanim infrastrukturalnim partnerima:
                Supabase (sigurna baza podataka), Resend (slanje transakcionih mailova) i Paddle (licencirani Merchant of Record i procesor kartičnog plaćanja).
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px' }}>4. Bezbednost podataka</h2>
              <p>
                Svi podaci se prenose putem šifrovane HTTPS protokolske veze (SSL 256-bitna enkripcija). Pristup bazama podataka je strogo kontrolisan uz RLS (Row Level Security) pravila pristupa.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px' }}>5. Vaša prava</h2>
              <p>Imate pravo u svakom trenutku da zatražite:</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Uvid u vaše prikupljene podatke.</li>
                <li>Ispravku netačnih podataka.</li>
                <li>Potpuno brisanje vašeg naloga i svih povezanih podataka (&quot;Pravo na zaborav&quot;).</li>
              </ul>
              <p style={{ marginTop: '12px' }}>Za zahteve nas možete kontaktirati putem e-maila: <strong>podrska@glowlink.me</strong>.</p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 0', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>© {new Date().getFullYear()} GlowLink. Sva prava zadržana.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Uslovi Korišćenja</Link>
            <Link href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Politika Privatnosti</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
