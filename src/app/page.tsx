'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Handle hash fragments like #access_token=...&type=recovery
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      router.push('/auth/update-password' + window.location.hash)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/auth/update-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <header className="glass-panel landing-header" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo-brand" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>
            ✦ GlowLink
          </Link>
          <div className="nav-buttons-container" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginRight: '8px' }}>
              Cenovnik
            </a>
            <Link href="/auth" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              Prijavi se
            </Link>
            <Link href="/dashboard?demo=true" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: 'rgba(236, 72, 153, 0.4)' }}>
              Demo Nadzorna Tabla 📊
            </Link>
            <Link href="/jelena-nokti" className="btn btn-primary nav-demo-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Demo Booking 🌸
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section className="container animate-fade-in" style={{ padding: '70px 24px', textAlign: 'center' }}>
          <span className="badge badge-success" style={{ marginBottom: '16px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)' }}>
            Nova era zakazivanja za salone lepote 🚀
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.15', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px auto' }}>
            Pretvori pratioce sa Instagrama u <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>redovne klijente</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Baci svesku i olovku. GlowLink ti pruža izolovani link za tvoj Instagram bio, pametan kalendar, digitalni loyalty program i zaštitu od no-show klijenata.
          </p>

          {/* Primary Action Buttons (Inverted Hierarchy for max conversion) */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Link href="/jelena-nokti" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)' }}>
              Isprobaj Demo Booking 🌸
            </Link>
            <Link href="/dashboard?demo=true" className="btn btn-secondary" style={{ padding: '16px 26px', fontSize: '1rem', fontWeight: 600 }}>
              Isprobaj Demo Nadzornu Tablu 📊
            </Link>
            <Link href="/auth" className="btn btn-secondary" style={{ padding: '16px 24px', fontSize: '1rem', fontWeight: 600, background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#f8fafc' }}>
              Započni besplatno 🚀
            </Link>
          </div>

          {/* Micro-copy encouraging friction-free exploration */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>⚡ Bez registracije</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>⏱ Instant pristup za 10 sekundi</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>💳 Nije potrebna kartica</span>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container" style={{ padding: '40px 24px 80px 24px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.25rem' }}>Izgrađeno specijalno za kozmetičarke, šminkerke i frizerke</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>🔗</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Link-in-bio Kalendar</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Dobijaš svoj unikatni link (npr. glowlink.com/jelena-nokti) koji postavljaš u opis profila. Klijenti sami zakazuju bez potrebe da te prekidaju tokom rada.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>📱</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Instagram Story Generator</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Zaboravi na sate u Canvi. Jednim klikom generiši prelepu sliku slobodnih termina za tvoj Story sa sopstvenim logoom i bojama salona.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>★</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Digitalni Loyalty Program</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Nema više papirnih kartica koje se gube. Sistem sam prepoznaje da je klijentkinja došla 4 puta i na 5. zakazivanju automatski odobrava gratis popust.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>👥</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Karton Klijenta (Mini CRM)</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Sačuvaj interne beleške o klijentima: "Osetljive zanoktice, radile crveni frenč". Kada dođe ponovo, odmah znaš njene želje, stvarajući neverovatan profesionalni utisak.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>⏳</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Pametna Lista Čekanja</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Kada se oslobodi popunjen termin usled otkazivanja, sistem automatski obaveštava klijente na listi čekanja. Tvoji slobodni slotovi nikada više neće propasti.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block' }}>⚠️</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Zaštitna Crna Lista</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Flaguj nepouzdane klijente koji otkazuju u zadnji čas. Sledeći put kada pokušaju da zakažu, sistem stavlja njihov termin na čekanje kako bi ih ti ručno odobrila (i zatražila depozit).
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container" style={{ padding: '60px 24px 80px 24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-success" style={{ marginBottom: '12px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)' }}>
              TRANSPARENTNE CENE 💳
            </span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Izaberite plan po vašoj meri</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Započnite sa 14 dana besplatnog probnog perioda. Bez platne kartice unapred i bez skrivenih troškova.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
            
            {/* Monthly Card */}
            <div className="glass-panel" style={{ padding: '36px 28px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Mesečni Paket</h3>
                  <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)', fontWeight: 'bold' }}>Mesečno</span>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>2.000 RSD</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / mesec</span>
                </div>
                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Neograničen broj klijenata i zakazivanja</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Personalizovan Instagram Link-in-bio</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Instagram Story Generator za slobodne slotove</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Digitalni Loyalty kartoni sa pečatima</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> Pametna Lista Čekanja i Zaštitna Crna Lista</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> E-mail obaveštenja klijentima i salonu</li>
                </ul>
              </div>
              <Link href="/auth" className="btn btn-primary" style={{ width: '100%', padding: '14px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                Započni 14 dana besplatno 🚀
              </Link>
            </div>

            {/* Yearly Card */}
            <div className="glass-panel" style={{ padding: '36px 28px', borderRadius: '20px', border: '2px solid var(--accent-gold)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: 'rgba(212, 175, 55, 0.03)' }}>
              <div style={{ position: 'absolute', top: '-14px', right: '28px', background: 'var(--accent-gold)', color: '#1c1917', fontSize: '0.8rem', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(212,175,55,0.4)' }}>
                Ušteda 2 meseca GRATIS 🎁
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>Godišnji Paket</h3>
                  <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-gold)', fontWeight: 'bold' }}>Najpopularnije</span>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>18.000 RSD</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / godina</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, marginTop: '4px' }}>Samo 1.500 RSD mesečno (Ušteda 6.000 RSD)</div>
                </div>
                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>✓</span> <strong>Sve iz mesečnog paketa</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>✓</span> <strong>2 meseca plaćanja potpunosti GRATIS</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>✓</span> Prioritetna VIP podrška 24/7</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>✓</span> Besplatna pomoć pri podešavanju naloga</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>✓</span> Zagarancija fiksne cene (bez poskupljenja)</li>
                </ul>
              </div>
              <Link href="/auth" className="btn" style={{ width: '100%', padding: '14px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', background: 'var(--accent-gold)', color: '#1c1917', border: 'none' }}>
                Započni godišnji plan 👑
              </Link>
            </div>

          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container" style={{ padding: '40px 24px 80px 24px', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '12px', fontSize: '2.25rem' }}>Šta kažu devojke koje koriste GlowLink?</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '1rem' }}>Preko 100+ devojaka je već bacilo sveske i olovke</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                "Otkad imam svoj GlowLink u opisu Instagrama, više ne trošim vreme na kuckanje poruka uveče. Klijentkinje same zakazuju, a Story Generator mi štedi sate dizajna."
              </p>
              <strong>Jelena M.</strong> <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nail Artist, Novi Sad</span>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                "CRM karton je neverovatna caka. Kada klijentkinja dođe i kažem joj 'Hoćemo li istu crvenu boju od prošlog puta i da pazim na zanoktice?', stvara se neverovatan wow efekat profesionalizma."
              </p>
              <strong>Marija K.</strong> <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Make-Up Artist, Beograd</span>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                "Crna lista je spas! Klijentkinje koje zakažu pa se ne pojave sada idu na ručno odobrenje i moraju da mi uplate depozit pre potvrde. Više nemam praznih rupa u kalendaru."
              </p>
              <strong>Sanja T.</strong> <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kozmetički Salon, Niš</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 0', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>© {new Date().getFullYear()} GlowLink. Sva prava zadržana.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
            <Link href="/jelena-nokti" style={{ color: 'var(--text-muted)' }}>Demo Kalendar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
