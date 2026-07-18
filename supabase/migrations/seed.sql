-- SQL Seed Script for GlowLink
-- Koristite ovo u SQL Editoru na Supabase-u nakon što se registrujete i kreirate salon
-- da biste brzo napunili bazu probnim uslugama i klijentima.

-- 1. PRONAĐITE ID SVOG SALONA:
-- Pokrenite: SELECT id, name FROM public.salons;
-- Zamenite 'UPISI_ID_SALONA_OVDE' sa UUID-om vašeg salona iz rezultata.

-- 2. UBACITE USLUGE (Zamenite UPISI_ID_SALONA_OVDE sa pravim ID-jem):
-- INSERT INTO public.services (salon_id, name, description, duration_minutes, price, is_active) VALUES
-- ('UPISI_ID_SALONA_OVDE', 'Izlivanje noktiju', 'Kompletno izlivanje sa šablonima i dizajnom po želji.', 60, 2500, true),
-- ('UPISI_ID_SALONA_OVDE', 'Korekcija noktiju', 'Korekcija gela, skraćivanje i promena boje.', 45, 1800, true),
-- ('UPISI_ID_SALONA_OVDE', 'Gel lak', 'Ojačavanje prirodnih noktiju gel lakom.', 30, 1200, true),
-- ('UPISI_ID_SALONA_OVDE', 'Svilene trepavice', 'Nadogradnja svilenih trepavica 1 na 1.', 90, 3000, true);

-- 3. UBACITE TEST KLIJENTE (Zamenite UPISI_ID_SALONA_OVDE sa pravim ID-jem):
-- INSERT INTO public.clients (salon_id, full_name, phone, email, notes) VALUES
-- ('UPISI_ID_SALONA_OVDE', 'Milica Petrović', '065111222', 'milica@example.com', 'Prethodni put radile crveni frenč, ima osetljive zanoktice.'),
-- ('UPISI_ID_SALONA_OVDE', 'Ana Marić', '066333444', 'ana@example.com', 'Otkazala 2 puta u zadnji čas. (Na crnoj listi)'),
-- ('UPISI_ID_SALONA_OVDE', 'Jovana Lukić', '064555666', 'jovana@example.com', 'Uvek tačna, preferira tihe termine.');

-- 4. UBACITE ANU MARIĆ NA CRNU LISTU:
-- INSERT INTO public.blacklist (salon_id, client_phone, reason, requires_manual_approval) VALUES
-- ('UPISI_ID_SALONA_OVDE', '066333444', 'No-show i otkazivanje u zadnji čas.', true);
