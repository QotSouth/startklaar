# Startklaar — Klantenportaal

Een zelfstandige Next.js 14 (App Router) applicatie waarmee klanten van
Startklaar de voortgang van hun project volgen en bestanden downloaden, en
waarmee de beheerder projecten beheert.

Een self-contained Next.js 14 (App Router) app: a customer portal (Supabase
magic-link login) plus a password-protected admin area.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — cookie-based auth
- Tailwind CSS (mobile-first)

## Rollen / Roles

- **Klant / Customer** — logt in via een Supabase magic link (e-mail).
- **Admin** — beschermd met een wachtwoord (`ADMIN_PASSWORD`), los van Supabase
  auth, via een ondertekende httpOnly-cookie (`admin_session`).

---

## Installatie (NL)

1. **Maak een Supabase-project** aan op https://supabase.com.
2. **Voer `supabase/schema.sql` uit** in de SQL-editor van je Supabase-project.
   Dit maakt de tabellen, de `updated_at`-trigger en de RLS-policies aan.
3. **Maak een PRIVATE storage bucket** met exact de naam `project-files`
   (Storage → New bucket → zet "Public bucket" UIT).
4. **Zet e-mail magic link auth aan**: Authentication → Providers → Email
   (Magic Link aan). Stel onder Authentication → URL Configuration de
   **Site URL** in (bv. `http://localhost:3000` lokaal of je Vercel-URL in
   productie) en voeg bij **Redirect URLs** `…/auth/callback` toe
   (bv. `http://localhost:3000/auth/callback`).
5. **Kopieer `.env.example` naar `.env.local`** en vul de waarden in
   (zie hieronder).
6. `npm install`
7. `npm run dev` en open http://localhost:3000

### Admin

De admin logt in op `/admin/login` met het wachtwoord uit `ADMIN_PASSWORD`.
De admin gebruikt server-side de Supabase **service role key** en omzeilt zo
RLS, zodat alle projecten beheerd kunnen worden.

---

## Installation (EN)

1. **Create a Supabase project** at https://supabase.com.
2. **Run `supabase/schema.sql`** in the Supabase SQL editor (creates tables,
   the `updated_at` trigger and the RLS policies).
3. **Create a PRIVATE storage bucket** named exactly `project-files`
   (turn the "Public bucket" toggle OFF).
4. **Enable Email magic link auth**, set the **Site URL** and add
   `…/auth/callback` to the **Redirect URLs**.
5. **Copy `.env.example` to `.env.local`** and fill in the keys.
6. `npm install`
7. `npm run dev`

---

## Omgevingsvariabelen / Environment variables

Zie `.env.example`:

| Variabele | Uitleg |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publieke anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-only**, nooit naar de browser |
| `ADMIN_PASSWORD` | Wachtwoord voor de admin login |
| `NEXT_PUBLIC_SITE_URL` | Basis-URL voor magic-link redirects (zonder slash op het einde) |

---

## Beveiliging / Security

- Klanten zien **uitsluitend** projecten gekoppeld aan hun e-mailadres. Dit is
  dubbel afgedwongen: (1) in de query (filter op de eigen client-id's) en
  (2) via RLS-policies in de database.
- Downloads gebeuren altijd via **signed URLs** uit de **private** bucket,
  server-side gegenereerd nadat de toegang is gecontroleerd
  (`/project/[id]/download`). De service key en de bucket worden nooit
  rechtstreeks aan de klant blootgesteld.
- De admin-sessie is een ondertekende (HMAC, afgeleid van `ADMIN_PASSWORD`)
  httpOnly-cookie.

---

## Deployen / Deployment

Deze app draait server-side (Server Actions, route handlers, cookies) en hoort
op **Vercel** (of een ander Node-platform), **niet** op GitHub Pages.

1. Importeer de repo in Vercel.
2. Zet de root naar `portaal/` indien nodig.
3. Voeg alle omgevingsvariabelen toe in de Vercel-projectinstellingen.
4. Zet `NEXT_PUBLIC_SITE_URL` op je productie-URL en voeg die + `/auth/callback`
   toe bij de Supabase Redirect URLs.

---

## Bekende MVP-beperkingen / Known limitations

- **Betalingen** en de **intake-flow** zijn nog niet geïmplementeerd. Er is een
  duidelijk gemarkeerde placeholder op de projectpagina
  (`app/project/[id]/page.tsx`) waar dit later kan worden ingebouwd.
- De knoppen "Bestanden opnieuw aanvragen" en "Vraag wijziging aan" openen
  voorlopig enkel een `mailto:` naar `info@startklaar.be`.
- Eén e-mailadres = één klant. Een klant kan meerdere projecten hebben.
- Geen e-mailnotificaties bij statuswijzigingen (toekomstige uitbreiding).
- De admin-login is wachtwoord-gebaseerd (geen meerdere admin-accounts).
