'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
  Sparkles, 
  Calendar, 
  Wand2, 
  Crown, 
  Users, 
  Hourglass, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Clock, 
  CreditCard, 
  Star,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react'

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
          <Link href="/" className="logo-brand" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} style={{ color: 'var(--primary)' }} /> GlowLink
          </Link>
          <div className="nav-buttons-container" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#pricing" className="nav-pricing-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginRight: '8px' }}>
              Cenovnik
            </a>
            <Link href="/auth" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              Prijavi se
            </Link>
            <Link href="/dashboard?demo=true" className="btn btn-secondary nav-demo-dashboard-btn" style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: 'rgba(236, 72, 153, 0.4)', gap: '6px' }}>
              <LayoutDashboard size={14} /> Demo Nadzorna Tabla
            </Link>
            <Link href="/jelena-nokti" className="btn btn-primary nav-demo-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', gap: '6px' }}>
              <Calendar size={14} /> Demo Booking
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section className="container hero-section animate-fade-in" style={{ padding: '70px 24px', textAlign: 'center' }}>
          <span className="badge badge-success" style={{ marginBottom: '16px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)', gap: '6px' }}>
            <Sparkles size={14} /> Nova era zakazivanja za salone lepote
          </span>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.15', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px auto' }}>
            Pretvori pratioce sa Instagrama u <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>redovne klijente</span>
          </h1>
          <p className="hero-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Baci svesku i olovku. GlowLink ti pruža izolovani link za tvoj Instagram bio, pametan kalendar, mini CRM bazu klijenata i zaštitu od no-show klijenata.
          </p>

          {/* Primary Action Buttons */}
          <div className="hero-buttons-wrapper" style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Link href="/jelena-nokti" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)', gap: '8px' }}>
              Isprobaj Demo Booking <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard?demo=true" className="btn btn-secondary" style={{ padding: '16px 26px', fontSize: '1rem', fontWeight: 600, gap: '8px' }}>
              <LayoutDashboard size={18} style={{ color: 'var(--primary)' }} /> Isprobaj Demo Nadzornu Tablu
            </Link>
            <Link href="/auth" className="btn btn-secondary" style={{ padding: '16px 24px', fontSize: '1rem', fontWeight: 600, background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#f8fafc' }}>
              Započni besplatno 🚀
            </Link>
          </div>

          {/* Micro-copy encouraging friction-free exploration */}
          <div className="hero-micro-copy" style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Zap size={14} style={{ color: 'var(--primary)' }} /> Bez registracije</span>
            <span className="dot-separator">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock size={14} style={{ color: 'var(--primary)' }} /> Instant pristup za 10 sekundi</span>
            <span className="dot-separator">•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CreditCard size={14} style={{ color: 'var(--primary)' }} /> Nije potrebna kartica</span>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container" style={{ padding: '40px 24px 80px 24px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.25rem' }}>Izgrađeno specijalno za kozmetičarke, šminkerke i frizerke</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--primary)' }}>
                <Calendar size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Link-in-bio Kalendar</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Dobijaš svoj unikatni link (npr. glowlink.me/jelena-nokti) koji postavljaš u opis profila. Klijenti sami zakazuju bez potrebe da te prekidaju tokom rada.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--primary)' }}>
                <Wand2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Instagram Story Generator</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Zaboravi na sate u Canvi. Jednim klikom generiši prelepu sliku slobodnih termina za tvoj Story sa sopstvenim logoom i bojama salona.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--primary)' }}>
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Karton Klijenta (Mini CRM)</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Sačuvaj interne beleške o klijentima: "Osetljive zanoktice, radile crveni frenč". Kada dođe ponovo, odmah znaš njene želje, stvarajući neverovatan profesionalni utisak.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--primary)' }}>
                <Hourglass size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Pametna Lista Čekanja</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Kada se oslobodi popunjen termin usled otkazivanja, sistem automatski obaveštava klijente na listi čekanja. Tvoji slobodni slotovi nikada više neće propasti.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#ef4444' }}>
                <ShieldAlert size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Zaštitna Crna Lista</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Flaguj nepouzdane klijente koji otkazuju u zadnji čas. Sledeći put kada pokušaju da zakažu, sistem stavlja njihov termin na čekanje kako bi ih ti ručno odobrila (i zatražila depozit).
              </p>
            </div>
          </div>
        </section>

        {/* Time & Money Savings Comparison Section */}
        <section className="container" style={{ padding: '60px 24px 40px 24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-success" style={{ marginBottom: '12px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)', gap: '6px' }}>
              <Hourglass size={14} /> POREĐENJE I UŠTEDA
            </span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Koliko vremena i novca gubite bez automatizacije?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
              Pogledajte razliku između ručnog zakazivanja preko poruka i automatizovanog GlowLink sistema.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto 48px auto' }}>
            
            {/* Without GlowLink Card */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <span style={{ fontSize: '1.5rem' }}>❌</span> Ručno zakazivanje (Poruke & Sveska)
              </div>
              <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span> <strong>60+ sati mesečno</strong> utrošenih na kuckanje poruka uveče.</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span> <strong>20.000+ RSD mesečnog gubitka</strong> jer klijentkinje zakažu pa se ne pojave.</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span> Stres i prekidanje rada tokom tretmana odgovorom na telefon.</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span> Gubitak slobodnih termina kada klijent otkaže u zadnji čas.</li>
              </ul>
              
              {/* Visual Bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: '#ef4444', fontWeight: 'bold' }}>
                  <span>Utrošeno vreme na obaveze:</span>
                  <span>60h / mesec</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#ef4444' }} />
                </div>
              </div>
            </div>

            {/* With GlowLink Card */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', border: '2px solid var(--primary)', background: 'rgba(236, 72, 153, 0.03)', boxShadow: '0 8px 32px rgba(236, 72, 153, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✨</span> Sa GlowLink sistemom (66 RSD/dan)
              </div>
              <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> <strong>0 sati kuckanja</strong> — klijenti sami zakazuju 24/7 preko vašeg linka.</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> <strong>0 RSD gubitaka</strong> uz pametnu Listu Čekanja i Zaštitnu Crnu Listu.</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> Potpuni mir dok radite bez zvrckanja i prekidanja telefona.</li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> Automatska E-mail podsećanja i digitalni Loyalty kartoni.</li>
              </ul>
              
              {/* Visual Bar */}
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  <span>Utrošeno vreme na obaveze:</span>
                  <span>0h / automatski</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: '5%', height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
            </div>

          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto', fontSize: '1rem', color: '#ffffff' }}>
            🎉 <strong>Ukupna neto ušteda:</strong> Dobijate preko <strong>60 sati slobodnog vremena mesečno</strong> za odmor ili 20 dodatnih zakazanih termina!
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container" style={{ padding: '60px 24px 80px 24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-success" style={{ marginBottom: '12px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)', gap: '6px' }}>
              <CreditCard size={14} /> TRANSPARENTNE CENE
            </span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Izaberite plan po vašoj meri</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Započnite sa 14 dana besplatnog probnog perioda. Bez platne kartice unapred i bez skrivenih troškova.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto', paddingTop: '16px' }}>
            
            {/* Monthly Card */}
            <div className="glass-panel" style={{ padding: '36px 28px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease', overflow: 'visible' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Mesečni Paket</h3>
                  <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)', fontWeight: 'bold' }}>Mesečno</span>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>2.000 RSD</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / mesec</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                    ☕ Samo 66 RSD dnevno — manje od jedne kafe u kafiću
                  </div>
                </div>
                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Neograničen broj klijenata i zakazivanja</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Personalizovan Instagram Link-in-bio</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Instagram Story Generator za slobodne slotove</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Pametna Lista Čekanja i Zaštitna Crna Lista</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> E-mail obaveštenja klijentima i salonu</li>
                </ul>
              </div>
              <Link href="/auth" className="btn btn-primary" style={{ width: '100%', padding: '14px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', gap: '8px' }}>
                Započni 14 dana besplatno <ArrowRight size={18} />
              </Link>
            </div>

            {/* Yearly Card */}
            <div className="glass-panel" style={{ padding: '36px 28px', borderRadius: '20px', border: '2px solid var(--accent-gold)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: 'rgba(212, 175, 55, 0.03)', overflow: 'visible' }}>
              <div style={{ position: 'absolute', top: '-14px', right: '24px', background: 'var(--accent-gold)', color: '#1c1917', fontSize: '0.8rem', fontWeight: 800, padding: '6px 14px', borderRadius: '20px', textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10, whiteSpace: 'nowrap' }}>
                <Crown size={14} /> UŠTEDA 3 MESECA GRATIS
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>Godišnji Paket</h3>
                  <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-gold)', fontWeight: 'bold' }}>Najpopularnije</span>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>18.000 RSD</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / godina</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, marginTop: '4px' }}>Samo 1.500 RSD mesečno (Ušteda 6.000 RSD)</div>
                  <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600, marginTop: '6px', background: 'rgba(74, 222, 128, 0.1)', padding: '6px 10px', borderRadius: '6px', display: 'inline-block' }}>
                    🎁 GRATIS podešavanje naloga: Mi unosimo vaše usluge za 5 min!
                  </div>
                </div>
                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} /> <strong>Sve iz mesečnog paketa</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} /> <strong>3 meseca plaćanja u potpunosti GRATIS</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} /> 🎁 <strong>White-Glove podrška:</strong> Mi unosimo cene i usluge za 5 min</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} /> Prioritetna VIP podrška 24/7</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} /> Garancija fiksne cene (bez poskupljenja)</li>
                </ul>
              </div>
              <Link href="/auth" className="btn" style={{ width: '100%', padding: '14px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', background: 'var(--accent-gold)', color: '#1c1917', border: 'none', gap: '8px' }}>
                Započni godišnji plan <Crown size={18} />
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
              <div style={{ color: 'var(--accent-gold)', marginBottom: '12px', display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                "Otkad imam svoj GlowLink u opisu Instagrama, više ne trošim vreme na kuckanje poruka uveče. Klijentkinje same zakazuju, a Story Generator mi štedi sate dizajna."
              </p>
              <strong>Jelena M.</strong> <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nail Artist, Novi Sad</span>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--accent-gold)', marginBottom: '12px', display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                "CRM karton je neverovatna caka. Kada klijentkinja dođe i kažem joj 'Hoćemo li istu crvenu boju od prošlog puta i da pazim na zanoktice?', stvara se neverovatan wow efekat profesionalizma."
              </p>
              <strong>Marija K.</strong> <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Make-Up Artist, Beograd</span>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--accent-gold)', marginBottom: '12px', display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
              </div>
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
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Uslovi Korišćenja</Link>
            <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Politika Privatnosti</Link>
            <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
            <Link href="/jelena-nokti" style={{ color: 'var(--text-muted)' }}>Demo Kalendar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
