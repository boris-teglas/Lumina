import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <header className="glass-panel" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo-brand" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>
            ✦ GlowLink
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Dashboard
            </Link>
            <Link href="/jelena-nokti" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Vidi Demo Booking
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <span className="badge badge-success" style={{ marginBottom: '16px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)' }}>
            Nova era zakazivanja za salone lepote 🚀
          </span>
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1.15', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px auto' }}>
            Pretvori pratioce sa Instagrama u <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>redovne klijente</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Baci svesku i olovku. GlowLink ti pruža izolovani link za tvoj Instagram bio, pametan kalendar, digitalni loyalty program i zaštitu od no-show klijenata.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Započni besplatno
            </Link>
            <Link href="/jelena-nokti" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Isprobaj Demo Booking ↗
            </Link>
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
