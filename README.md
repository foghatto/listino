# ListinoRapido

Il listino servizi su codice QR per estetiste, parrucchieri e professionisti.
Sito statico multi-pagina (HTML + Tailwind + JS vanilla), pronto per **GitHub → Vercel**, con **Supabase** per account e dati.

## Pagine

| File | Cosa contiene |
| --- | --- |
| `index.html` | Landing: navbar, hero con splash e telefono scrollabile, scritte che scorrono, problema/soluzione, come funziona, esempio live (QR), prezzi, footer |
| `listino.html` | **Pagina pubblica del listino** (solo il listino, a schermo intero): è ciò che apre il QR. Il link pubblico è `/listino?s=nome-attivita` (funziona anche `/s/nome-attivita`). `?demo=1` / `?demo=pro` per gli esempi |
| `dashboard.html` | Dashboard: categorie, servizi, prezzi, anteprima, QR e link, profilo (nome, WhatsApp, link), statistiche (PRO). Dati di prova senza Supabase, dati reali con Supabase |
| `demo-pro.html` | Demo del piano Professionale: telefono scrollabile senza logo piattaforma, lingue IT/EN/FR, statistiche che reagiscono ai click |
| `accedi.html` | Accesso / registrazione (demo oppure Supabase Auth reale) |
| `note-legali.html` | Privacy, termini, cookie (**bozza da completare**) |
| `assets/store.js` | Livello dati della dashboard: localStorage (demo) oppure Supabase |
| `assets/data.js` | Dati di prova + funzione che disegna il listino (usata da landing, dashboard e demo) |
| `assets/config.js` | URL e anon key di Supabase |
| `supabase/schema.sql` | Tabelle, limite 10 servizi del Free, policy RLS, bucket immagini |

## Provarlo in locale

```bash
python3 -m http.server 8080   # oppure: npx serve .
# apri http://localhost:8080
```

## Pubblicare: GitHub → Vercel

1. Crea un repository su GitHub e carica la cartella (`git init && git add . && git commit -m "ListinoRapido" && git push`).
2. Su [vercel.com](https://vercel.com) → **Add New → Project** → importa il repository.
3. Framework preset: **Other**. Nessun build command, output directory: la radice. Premi **Deploy**.

`vercel.json` attiva gli URL puliti (`/dashboard` invece di `/dashboard.html`) e alcuni header di sicurezza.

## Collegare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. **SQL Editor** → incolla ed esegui `supabase/schema.sql`.
3. **Authentication → URL Configuration**: imposta *Site URL* sul dominio Vercel e aggiungi tra i *Redirect URLs* sia `https://tuo-dominio.vercel.app/dashboard` sia `https://tuo-dominio.vercel.app/accedi` (serve al link "Password dimenticata?").
4. **Project Settings → API**: copia *Project URL* e *anon public key* in `assets/config.js`.
   La anon key è pubblica per design: la sicurezza è garantita dalle policy RLS dello schema. **Non** mettere mai la `service_role` key nel sito.

Con `config.js` vuoto tutto funziona in **modalità demo** (accesso finto, dati nel `localStorage` del browser).

### Cosa è collegato

- ✅ `accedi.html`: registrazione e login reali con Supabase Auth.
- ✅ `dashboard.html`: al primo accesso crea la tua attività (piano Free) e salva categorie, servizi e profilo nelle tabelle.
- ✅ `listino.html` / `/s/<link>`: legge il listino da Supabase (lettura pubblica) e registra visite e click WhatsApp in `page_views`.
- ✅ Limite di 10 servizi del Free applicato anche dal database.
- ⏳ Caricamento delle foto dei servizi (bucket `service-images` già predisposto nello schema, manca il pulsante di upload).
- ⏳ Pagamento del piano PRO: `venues.plan` può essere cambiato solo dal backend (service_role, es. webhook Stripe), mai dal browser.

Per provare il piano PRO prima di avere i pagamenti, esegui nel SQL Editor di Supabase:

```sql
update public.venues set plan = 'pro' where slug = 'il-tuo-link';
```

> Il QR usa `/listino?s=<link>`, che funziona ovunque (anche in locale con `listino.html?s=<link>`). La scorciatoia `/s/<link>` usa una riscrittura di Vercel (`vercel.json`).

## Immagini

Le foto sono hotlink da Unsplash (hero, listino, esempi). Se un'immagine non si carica, la grafica ripiega su un fondo sfumato verde, senza spazi rotti.
Per un sito in produzione scarica le foto che vuoi usare, mettile in `assets/img/` e cambia gli URL in `index.html` e `assets/data.js`.

## Prima di andare online

- Compila `note-legali.html` con i dati reali (ora ci sono segnaposto).
- Tailwind è caricato dal CDN, comodo per partire; per la produzione conviene compilarlo (`npx tailwindcss -o assets/tailwind.css --minify`) e togliere lo script CDN.
- Sostituisci il numero WhatsApp di prova in `assets/data.js`.

## Novità: foto, modifica servizi, prenotazione WhatsApp

- **Foto**: dalla dashboard puoi caricare, sostituire e rimuovere la foto di ogni servizio e la foto di copertina (Profilo → Foto di copertina). Le immagini vengono ridimensionate nel browser e salvate nel bucket `service-images` (richiede `supabase/schema.sql`; facoltativo: `supabase/storage-limits.sql` per limitare peso e formato).
- **Modifica servizio**: icona ✎ accanto a ogni servizio (nome, categoria, prezzo, durata, descrizione, foto).
- **Prenota su WhatsApp**: inserisci il numero in Profilo; accanto a ogni servizio compare il pulsante verde "Prenota" con il simbolo WhatsApp. Senza numero il pulsante non viene mostrato ai clienti.
- **Piano PRO**: al lancio il sito è gratuito e il PRO **non è acquistabile** (pagina prezzi, demo PRO e dashboard lo indicano). La demo PRO resta visibile.
