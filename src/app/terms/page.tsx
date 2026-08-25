'use client'

import Link from 'next/link'
import { Sparkles, ArrowLeft, FileText, CheckCircle2, AlertTriangle, Shield, CreditCard } from 'lucide-react'

export default function TermsPage() {
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
              <FileText size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Uslovi Korišćenja</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Poslednje ažuriranje: {new Date().toLocaleDateString('sr-RS')}</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.98rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} /> 1. Prihvatanje uslova
              </h2>
              <p>
                Pristupanjem i korišćenjem <strong>GlowLink</strong> web aplikacije (u daljem tekstu &quot;Platforma&quot;), prihvatate u potpunosti ove Uslove korišćenja. Ako se ne slažete sa bilo kojim delom ovih uslova, nemojte koristiti naše usluge.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} style={{ color: 'var(--primary)' }} /> 2. Opis usluge
              </h2>
              <p>
                GlowLink pruža softversko rešenje u vidu usluge (SaaS) namenjeno salonima lepote i samostalnim radnicima u industriji lepote. Platforma omogućava kreiranje personalizovanih linkova za zakazivanje, upravljanje kalendarom, CRM bazu klijenata i generator slika za Instagram.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} style={{ color: 'var(--primary)' }} /> 3. Pretplata, Cene i Otkazivanje
              </h2>
              <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Probni period (Trial):</strong> Novi korisnici mogu ostvariti pravo na besplatan probni period. Nije potrebna platna kartica za započinjanje probnog perioda.</li>
                <li><strong>Planovi pretplate:</strong> Nakon isteka probnog perioda, korišćenje platforme se naplaćuje prema mesečnom ili godišnjem cenovniku istaknutom u kontrolnoj tabli.</li>
                <li><strong>Otkazivanje pretplate:</strong> Pretplatu možete otkazati u bilo kom trenutku jednim klikom putem korisničkog portala. Nakon otkazivanja, vaša licenca ostaje aktivna do kraja već uplaćenog obračunskog perioda.</li>
                <li><strong>Politika povraćaja novca (14 dana garancije povraćaja):</strong> U skladu sa standardnim Paddle uslovima poslovanja (Paddle Buyer Terms) i zaštite kupaca, korisnici imaju pravo na pun povraćaj uplaćenog iznosa u roku od 14 dana od datuma kupovine pretplate. Zahtev za refundaciju možete uputiti u bilo kom trenutku na e-mail: <strong>podrska@glowlink.me</strong> ili direktno preko Paddle korisničkog portala.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} style={{ color: 'var(--primary)' }} /> 4. Odgovornost korisnika i ograničenje odgovornosti
              </h2>
              <p>
                Korisnici (saloni) su odgovorni za tačnost unetih informacija o svojim uslugama i cenama. GlowLink ne snosi odgovornost za nepojavljivanje klijenata na zakazanim tretmanima ili eventualne nesporazume između salona i njihovih krajnjih klijenata.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '12px' }}>5. Kontakt i Podrška</h2>
              <p>Za sva pitanja u vezi sa uslovima korišćenja, možete nas kontaktirati na e-mail: <strong>podrska@glowlink.me</strong>.</p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 0', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>© {new Date().getFullYear()} GlowLink. Sva prava zadržana.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/terms" style={{ color: 'var(--primary)', fontWeight: 600 }}>Uslovi Korišćenja</Link>
            <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Politika Privatnosti</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
