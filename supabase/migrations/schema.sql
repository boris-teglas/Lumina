-- SQL Schema for GlowLink Beauty SaaS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id);

-- Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Vlasnik Salona'));
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- 2. SALONS Table
create table public.salons (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    slug text not null unique,
    description text,
    logo_url text,
    banner_url text,
    theme_color text default '#EC4899', -- default pink
    working_hours jsonb not null default '{
        "mon": {"open": "09:00", "close": "17:00", "is_working": true},
        "tue": {"open": "09:00", "close": "17:00", "is_working": true},
        "wed": {"open": "09:00", "close": "17:00", "is_working": true},
        "thu": {"open": "09:00", "close": "17:00", "is_working": true},
        "fri": {"open": "09:00", "close": "17:00", "is_working": true},
        "sat": {"open": "09:00", "close": "14:00", "is_working": true},
        "sun": {"open": "00:00", "close": "00:00", "is_working": false}
    }'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for salons
alter table public.salons enable row level security;

create policy "Salons are publicly viewable by slug" on public.salons
    for select using (true);

create policy "Owners can insert their own salon" on public.salons
    for insert with check (auth.uid() = owner_id);

create policy "Owners can update their own salon" on public.salons
    for update using (auth.uid() = owner_id);


-- 3. SERVICES Table
create table public.services (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    name text not null,
    description text,
    duration_minutes integer not null default 30,
    price numeric not null,
    image_url text,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for services
alter table public.services enable row level security;

create policy "Services are publicly viewable" on public.services
    for select using (is_active = true);

create policy "Salon owners can manage services" on public.services
    for all using (
        exists (
            select 1 from public.salons
            where salons.id = services.salon_id and salons.owner_id = auth.uid()
        )
    );


-- 4. CLIENTS Table
create table public.clients (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    full_name text not null,
    phone text not null,
    email text,
    notes text, -- CRM notes (sensitive cuticles, preferences etc.)
    total_bookings integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (salon_id, phone)
);

-- Enable RLS for clients
alter table public.clients enable row level security;

-- Allow public inserts for clients (booking flow)
create policy "Anyone can create a client profile during booking" on public.clients
    for insert with check (true);

-- Only salon owners can view and manage their clients
create policy "Salon owners can view and manage clients" on public.clients
    for all using (
        exists (
            select 1 from public.salons
            where salons.id = clients.salon_id and salons.owner_id = auth.uid()
        )
    );


-- 5. APPOINTMENTS Table
create table public.appointments (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    service_id uuid references public.services(id) on delete restrict not null,
    client_id uuid references public.clients(id) on delete cascade not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    silent_appointment boolean default false not null,
    price_charged numeric,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_appointments_salon_time on public.appointments(salon_id, start_time);
create index idx_appointments_client on public.appointments(client_id);

-- Enable RLS for appointments
alter table public.appointments enable row level security;

-- Clients can insert a booking
create policy "Clients can insert appointments" on public.appointments
    for insert with check (true);

-- Clients can view their own appointments by ID
create policy "Clients can view their own appointment" on public.appointments
    for select using (true); -- Keep public so client can see confirmation details by ID

-- Salon owners have full access
create policy "Salon owners can manage appointments" on public.appointments
    for all using (
        exists (
            select 1 from public.salons
            where salons.id = appointments.salon_id and salons.owner_id = auth.uid()
        )
    );


-- 6. LOYALTY CARDS Table
create table public.loyalty_cards (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    client_id uuid references public.clients(id) on delete cascade not null unique,
    stamps_count integer default 0 not null check (stamps_count >= 0 and stamps_count <= 5),
    reward_ready boolean default false not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.loyalty_cards enable row level security;

create policy "Loyalty cards are viewable by everyone" on public.loyalty_cards
    for select using (true);

create policy "Salon owners can manage loyalty cards" on public.loyalty_cards
    for all using (
        exists (
            select 1 from public.salons
            where salons.id = loyalty_cards.salon_id and salons.owner_id = auth.uid()
        )
    );


-- 7. WAITLIST Table
create table public.waitlist (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    client_id uuid references public.clients(id) on delete cascade not null,
    preferred_date date not null,
    preferred_time_slots jsonb, -- e.g., ["morning", "afternoon"]
    status text default 'active' not null check (status in ('active', 'notified', 'fulfilled', 'expired')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.waitlist enable row level security;

create policy "Clients can join waitlist" on public.waitlist
    for insert with check (true);

create policy "Salon owners can manage waitlist" on public.waitlist
    for all using (
        exists (
            select 1 from public.salons
            where salons.id = waitlist.salon_id and salons.owner_id = auth.uid()
        )
    );


-- 8. BLACKLIST Table
create table public.blacklist (
    id uuid default gen_random_uuid() primary key,
    salon_id uuid references public.salons(id) on delete cascade not null,
    client_phone text not null,
    reason text,
    requires_manual_approval boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (salon_id, client_phone)
);

-- Enable RLS
alter table public.blacklist enable row level security;

-- Blacklist is read-only for public select to verify booking restriction during booking flow
create policy "Public can read blacklist to enforce check" on public.blacklist
    for select using (true);

create policy "Salon owners can manage blacklist" on public.blacklist
    for all using (
        exists (
            select 1 from public.salons
            where salons.id = blacklist.salon_id and salons.owner_id = auth.uid()
        )
    );


-- ==================== AUTOMATED TRIGGERS ====================

-- Trigger: Automatically manage Loyalty stamps when an appointment becomes 'completed'
create or replace function public.manage_completed_appointment()
returns trigger as $$
declare
    current_stamps integer;
begin
    -- 1. Update total_bookings count on clients table
    if (new.status = 'completed') then
        update public.clients
        set total_bookings = total_bookings + 1
        where id = new.client_id;
        
        -- 2. Handle Loyalty stamps (each 5th visit reward)
        -- Get or create loyalty card
        insert into public.loyalty_cards (salon_id, client_id, stamps_count, reward_ready)
        values (new.salon_id, new.client_id, 0, false)
        on conflict (client_id) do nothing;
        
        select stamps_count into current_stamps
        from public.loyalty_cards
        where client_id = new.client_id;
        
        if (current_stamps = 4) then
            -- 5th visit reached! Reward ready
            update public.loyalty_cards
            set stamps_count = 5, reward_ready = true, updated_at = now()
            where client_id = new.client_id;
        elsif (current_stamps >= 5) then
            -- If client already used reward, start over
            update public.loyalty_cards
            set stamps_count = 1, reward_ready = false, updated_at = now()
            where client_id = new.client_id;
        else
            update public.loyalty_cards
            set stamps_count = stamps_count + 1, reward_ready = false, updated_at = now()
            where client_id = new.client_id;
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_appointment_completed
    after update of status on public.appointments
    for each row
    when (old.status <> 'completed' and new.status = 'completed')
    execute procedure public.manage_completed_appointment();
