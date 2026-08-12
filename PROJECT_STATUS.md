# ✦ GlowLink (Lumina) – Status Projekta i Primopredaja

Ovaj dokument sadrži kompletan pregled arhitekture, urađenih funkcionalnosti, konfiguracije baze i uputstava za nastavak rada na projekatu **GlowLink (Lumina)**.

---

## 📌 Osnovne Informacije

* **Naziv Projekta:** GlowLink (Lumina)
* **Opis:** All-in-one SaaS platforma za automatizaciju zakazivanja termina, CRM klijente, loyalty programe i monetizaciju lepote i kozmetičkih salona.
* **Zvanični Domen:** `https://glowlink.me` (Povezan na Vercel sa besplatnim HTTPS SSL sertifikatom)
* **Vercel Produkcijski URL:** `https://lumina-zeta-five.vercel.app`
* **GitHub Repozitorijum:** [https://github.com/boris-teglas/Lumina](https://github.com/boris-teglas/Lumina) (grana `master`)
* **Supabase Project Ref:** `vvfhhpkphgzfhtcpxkpw`

---

## 🛠️ Tehnološki Stog (Tech Stack)

* **Frontend Framework:** Next.js (App Router, Turbopack, TypeScript)
* **Baza i Autentifikacija:** Supabase PostgreSQL & Supabase Auth
* **Monetizacija:** Lemon Squeezy (Mesečni & Godišnji paketi sa Webhook automatizacijom)
* **Hosting & CI/CD:** Vercel (Automatski build pri push-u na `master`)
* **Stilovi & UI:** Vanilla CSS (`globals.css`, `dashboard.css`, `booking.css`, `auth.css`), responzivni dark mode sa glassmorphism efektima i kliznim menijem (drawer) na mobilnim telefonima.

---

## 🗄️ Baza Podataka (Supabase Schema)

Svih 9 tabela u `public` šemi imaju omogućen **Row Level Security (RLS)** (`rls_enabled: true`) i 0 sigurnosnih upozorenja na Supabase Advisor-u:

1. `public.profiles` – Profil vlasnika salona (veza sa `auth.users.id`).
2. `public.salons` – Podaci o salonu, slug, radno vreme, pretplata (`subscription_status`, `subscription_expires_at`, `billing_portal_url`).
3. `public.services` – Cenovnik i lista usluga (trajanje, cena, kategorija, aktivnost).
4. `public.clients` – CRM baza klijenata sa istorijom i privatnim napomenama.
5. `public.appointments` – Termini i statusi (`pending`, `confirmed`, `completed`, `cancelled`, `no_show`, `silent_appointment`).
6. `public.loyalty_cards` – Kartice lojalnosti (0-5 pečata, gratis popusti).
7. `public.waitlist` – Automatska lista čekanja za popunjene dane.
8. `public.blacklist` – Crna lista neozbiljnih klijenata.
9. `public.reviews` – Ocene i utisci klijenata (1-5 zvezdica).

---

## ✅ Šta je Sve Kompletirano i Istestirano

### 1. Javna Početna Stranica (`/`)
* Hero sekcija sa opisom servisa.
* Prezentacija mogućnosti (Link-in-bio, Story Generator, CRM, Loyalty, Waitlist, Blacklist).
* Cenovnik sa mesečnim i godišnjim paketima.
* Direktni linkovi ka demo verzijama koji rade 100% bez 404 grešaka.

### 2. Autentifikacija (`/auth`)
* Unificirani ekran za Prijavu, Registraciju i Zaboravljenu lozinku (`/auth`).
* Podrška za resetovanje lozinke sa verifikacionom stranicom (`/auth/update-password`) i PKCE callback preusmeravanjem (`/auth/callback`).
* Uklonjena stara duplirana login forma sa `/dashboard` stranice – odjava sada čisto preusmerava na zvaničnu `/auth` stranicu.
* Dugme za instant pristup demo modu: `Vidi Demo mod (bez registracije)`.

### 3. Nadzorna Tabla za Salone (`/dashboard`)
* Responzivni mobilni header sa hamburger dugmetom (`☰`) i kliznim sidemenu drawer-om.
* Mesečna statistika i zarada.
* Interaktivni kalendar sa nedeljnim horizontalnim skrolom.
* Upravljanje uslugama (dodavanje, izmena, brisanje, kategorije).
* Mini CRM baza klijenata sa privatnim zabeleškama.
* Instagram Story Generator (izvoz slika slobodnih termina).
* Ocene & Utisci klijenata.
* **Podešavanja Salona & Digitalni Loyalty Program:** Potpuna kontrola nad sistemom lojalnosti – vlasnica salona sada može uključiti/isključiti program, sama odabrati broj potrebnih pečata (3, 5, 8, 10, 15 poseta) i uneti sopstveni opis nagrade (gratis tretman, popust u % ili fiksni RSD popust). U CRM-u vlasnica ima ručne kontrole za dodavanje pečata (+1) i resetovanje nagrade.
* **Pretplata & Račun:** Sakriva cenovnike kada je nalog aktivan. Uklonjen IPS uplatnica deo, plaćanja idu isključivo automatski putem platnih kartica (Lemon Squeezy). U Demo modu prikazuje jasnu obavest da je nalog u režimu pregleda.

### 4. Javni Booking Link (`/[slug]`)
* Demo rezerva za `glowlink.me/jelena-nokti` i `glowlink.me/demo`.
* Izbor usluga po kategorijama, odabir slobodnog datuma i vremena.
* Provera i dodeljivanje digitalnih pečata lojalnosti.
* Upišite se na listu čekanja ako su termini popunjeni.
* Slanje recenzija i ocena.

### 5. Lemon Squeezy Integracija (`/api/webhooks/lemonsqueezy`)
* Prenos `checkout[custom][salon_id]` parametra.
* Webhook Callback URL: `https://glowlink.me/api/webhooks/lemonsqueezy`.
* Automatsko prebacivanje statusa u `active` i produžavanje roka pretplate u Supabase bazi.

### 7. Pravne Stranice & GDPR Usaglašenost
* **Politika Privatnosti (`/privacy`):** Detaljno objašnjenje prikupljanja podataka (ime, email, telefon), svrhe obrade, bezbednosti i pravnih osnova u skladu sa GDPR i Zakonom o zaštiti podataka o ličnosti RS.
* **Uslovi Korišćenja (`/terms`):** Pravna pravila korišćenja platforme, pravila pretplate, otkazivanja i ograničenja odgovornosti (neophodno za merchant verifikaciju na Lemon Squeezy-ju).
* Povezani linkovi u podnožju (Footer) početne stranice i ekrana za prijavu.

### 7. Resend E-mail Automatizacija (`/api/send-email`)
* Verifikovan domen `glowlink.me` na Resend servisu preko Namecheap DNS zapisa (DKIM, SPF MX, SPF TXT, DMARC).
* Povezan Resend API sa skladištenim ključem u `.env.local`.
* Automatsko slanje prelepih HTML e-mail obaveštenja sa adrese `podrska@glowlink.me`:
  - **Potvrda klijentu:** Detalji rezervacije, vreme, cena, trajanje i podsetnik za "Tihi termin".
  - **Notifikacija salonu:** Obaveštenje vlasniku salona o novom zakazanom terminu sa kontakt podacima klijenta.


---

## 🚀 Uputstvo za Nastavak u Novom Chatu

Kada otvoriš novi chat sa AI asistentom, dovoljno je da napišeš:

> *"Ćao, nastavljamo rad na aplikaciji GlowLink (Lumina). Molim te pročitaj `PROJECT_STATUS.md` u korenu projekta da vidiš šta je sve urađeno."*

Asistent će odmah imati 100% jasan uvid u kompletan projekat!
