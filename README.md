# ListinoRapido

Il listino servizi su codice QR per estetiste, parrucchieri e professionisti.
Sito statico multi-pagina (HTML + Tailwind + JS vanilla), pronto per **GitHub → Vercel**, con **Supabase** per account e dati.

## Pagine

| File | Cosa contiene |
| --- | --- |
| `index.html` | Landing: navbar, hero con splash e telefono scrollabile, scritte che scorrono, problema/soluzione, come funziona, esempio live (QR), prezzi, footer |
| `dashboard.html` | Dashboard fittizia (si apre da "Inizia gratis"): categorie, servizi, prezzi, anteprima, QR, statistiche (bloccate nel Free) |
| `demo-pro.html` | Demo del piano Professionale: telefono scrollabile senza logo piattaforma, lingue IT/EN/FR, statistiche che reagiscono ai click |
| `accedi.html` | Accesso / registrazione (demo oppure Supabase Auth reale) |
| `note-legali.html` | Privacy, termini, cookie (**bozza da completare**) |
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
3. **Authentication → URL Configuration**: imposta *Site URL* sul dominio Vercel e aggiungi `https://tuo-dominio.vercel.app/dashboard` tra i *Redirect URLs*.
4. **Project Settings → API**: copia *Project URL* e *anon public key* in `assets/config.js`.
   La anon key è pubblica per design: la sicurezza è garantita dalle policy RLS dello schema. **Non** mettere mai la `service_role` key nel sito.

Con `config.js` vuoto tutto funziona in **modalità demo** (accesso finto, dati nel `localStorage` del browser).

### Cosa è già collegato e cosa no

- ✅ `accedi.html`: registrazione e login reali con Supabase Auth, se `config.js` è compilato.
- ✅ Schema database con RLS, limite Free di 10 servizi applicato lato database, bucket immagini.
- ⏳ `dashboard.html` usa ancora dati di prova nel browser: il passo successivo è sostituire `localStorage` con letture/scritture sulle tabelle `venues`, `categories`, `services`.
- ⏳ Pagina pubblica del listino per slug (`/s/<slug>`) e raccolta delle statistiche (`page_views`).
- ⏳ Pagamento del piano PRO: il campo `venues.plan` può essere cambiato solo dal backend (service_role, es. webhook Stripe), mai dal client.

## Immagini

Le foto sono hotlink da Unsplash (hero, listino, esempi). Se un'immagine non si carica, la grafica ripiega su un fondo sfumato verde, senza spazi rotti.
Per un sito in produzione scarica le foto che vuoi usare, mettile in `assets/img/` e cambia gli URL in `index.html` e `assets/data.js`.

## Prima di andare online

- Compila `note-legali.html` con i dati reali (ora ci sono segnaposto).
- Tailwind è caricato dal CDN, comodo per partire; per la produzione conviene compilarlo (`npx tailwindcss -o assets/tailwind.css --minify`) e togliere lo script CDN.
- Sostituisci il numero WhatsApp di prova in `assets/data.js`.
