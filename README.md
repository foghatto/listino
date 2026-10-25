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
- **Avvisami (lista d'attesa PRO)**: il box nella card PRO salva le email nella tabella `waitlist` (`supabase/waitlist.sql`, già in `schema.sql`). Le leggi da Supabase → Table Editor → `waitlist`.
- **Barra in alto**: se sei loggato la homepage mostra il tuo nome e il pulsante Esci; dopo Esci tornano Accedi e Inizia gratis.
- **Descrizioni lunghe**: fino a 1000 caratteri con a capo. Nel listino si vede un'anteprima di 2 righe e il pulsante "Leggi tutto" apre una scheda dal basso con foto, descrizione completa e il pulsante Prenota.
- **Dashboard Servizi**: categorie come chip con conteggio (rinomina/elimina sulla categoria scelta), ricerca, vista a schede o elenco, "+ Nuovo servizio" e modifica nella stessa finestra. Le descrizioni lunghe vanno a capo senza rompere la pagina.
- **Chi siamo**: descrizione dell'attività (fino a 1000 caratteri) in Profilo; compare sotto la foto di copertina del listino con "Leggi tutto". Richiede `supabase/about.sql` (colonna `venues.about`).
- **Orari e contatti**: in Profilo indirizzo, telefono, Instagram e orari per giorno (2 turni). Nel listino: "Aperto ora / Chiuso · riapre…", Indicazioni (Google Maps), Chiama, Instagram e scheda con gli orari. Richiede `supabase/hours-promo.sql`.
- **Servizi nascosti, promozioni, etichette**: occhio per nascondere un servizio senza cancellarlo; nella modifica "Prezzo prima della promo" (vecchio prezzo barrato e  0i sconto) ed etichette Novità / Consigliato. Stesso file SQL.

## Anteprima nelle chat (Open Graph)

I link `/listino?s=<link>[&servizio=<id>]` e `/s/<link>` passano da `api/listino.js`, che restituisce la pagina `listino` con i meta tag Open Graph:
con `servizio` l'anteprima mostra foto, nome e prezzo (con promo) del servizio; senza, nome e cover del listino. Usa solo la anon key pubblica
(da `SUPABASE_URL`/`SUPABASE_ANON_KEY` su Vercel, oppure da `assets/config.js`). WhatsApp mette in cache le anteprime: prova con un link mai condiviso prima.

## Locandina QR, modelli, promo a tempo

- **Locandina QR** (`locandina.html`, dalla dashboard: *QR code e link → Stampa locandina*): locandina A4 o 4 cartellini A6 da ritagliare, tema chiaro/scuro, testi modificabili, "Stampa / Salva PDF". Il QR usa il link breve `/<link>`.
- **Modelli per mestiere** (`assets/templates.js`): parrucchiere, estetista, nail artist, barbiere, massaggi. Dalla dashboard: *Parti da un modello*. Rispetta il limite di 10 servizi del Free; prezzi e durate sono esempi.
- **Promozioni con scadenza**: esegui una volta `supabase/promo-scadenza.sql` (colonna `services.promo_until`). Con la data impostata compare "Ancora N giorni"; dal giorno dopo il servizio torna al prezzo pieno da solo (listino, dashboard, messaggio di condivisione e anteprima WhatsApp).

## Indirizzo del listino

Il listino è raggiungibile su `https://<dominio>/<link>` (es. `/auroraestetic`), con `?servizio=<id>` per un singolo servizio. Restano validi i vecchi `/s/<link>` e `/listino?s=<link>`.
Funziona con una rewrite in `vercel.json` (le pagine vere, come `/dashboard`, hanno la precedenza). I nomi riservati sono bloccati in dashboard e, con `supabase/slug-riservati.sql`, anche nel database.

## Pannello amministratore

`/admin` (file `admin.html`, non linkata da nessuna parte): elenco di tutti gli account (email, conferma, attività, link, piano, servizi, visite, click WhatsApp, date di registrazione e ultimo accesso), filtri, ricerca, ordinamento, export CSV e lista d'attesa PRO.
Attivazione: esegui `supabase/admin.sql` e aggiungi la tua email alla tabella `admins` (istruzione in fondo al file). L'accesso è controllato dal database: chi non è in `admins` riceve "forbidden".

## Temi colore (PRO)
Tre palette per la pagina pubblica del listino: **Rosa cipria**, **Oro nero**, **Oceano** (la base resta lo smeraldo).
1. Esegui `supabase/temi.sql` nello SQL Editor (dopo `admin.sql`).
2. Dal pannello admin, nella tabella account, scegli il tema dal menu "Tema colore" (e, se serve, il piano dal menu "Piano").
3. Il tema si vede solo se la venue è PRO. Il cliente non può cambiarlo da solo.
Anteprima senza database: `/listino?demo=pro&tema=rose` (oppure `gold`, `ocean`).
I colori sono definiti in `assets/style.css` (blocco "Temi colore") e i nomi in `LR.THEMES` (`assets/data.js`): per aggiungere una palette bastano questi due punti, più il valore nel check di `temi.sql`.

## Accettazione di privacy e termini
- `assets/consent.js` mostra un popup con pulsante "Accetto" e salva data e versione nel browser (`lr_consent`).
  Finestra bloccante su accesso e dashboard (con casella da spuntare), riquadro in basso su landing e demo. Non compare sul listino pubblico.
- Alla registrazione serve anche la casella "Ho letto e accetto…"; data e versione dell'accettazione restano nei dati dell'utente su Supabase (`terms_accepted_at`, `terms_version`).
- Se cambi in modo sostanziale privacy o termini, aumenta `VERSION` in `consent.js` (e `terms_version` in `accedi.html`): il popup ricompare a tutti.
- Il link "Gestisci accettazione" nel footer della landing lo riapre.

## Note legali, consensi, eliminazione account
- **Email di contatto e data di aggiornamento** delle note legali: `assets/legal.js` (oggi `info@listinorapido.it`). Se il campo resta vuoto, in `note-legali.html` compare un avviso.
- Il servizio è descritto come gestito da una persona fisica e gratuito, senza vendita del piano PRO. Se cambia (società, partita IVA, abbonamenti), vanno riscritte privacy e termini e aumentata la versione in `assets/consent.js` (`VERSION`) e in `accedi.html` (`terms_version`).
- Alla registrazione servono due caselle: presa visione della privacy + accettazione dei termini, e approvazione specifica delle clausole 9-14 (artt. 1341-1342 c.c.). Se cambi la numerazione dei termini, aggiorna anche il testo di quella casella.
- Il modulo "Avvisami" richiede il consenso con una casella; la data dell'iscrizione (`created_at` in `waitlist`) è la prova.
- **Eliminare l'account** (dashboard → Profilo): esegui una volta `supabase/elimina-account.sql`. Cancella le foto e poi, a cascata, listino, servizi, statistiche e l'email in lista d'attesa.

## Risorse ospitate sul sito (nessun CDN esterno)
Font Inter e Sora (`assets/fonts/`), `supabase-js` e `qrcode` (`assets/vendor/`) e il CSS Tailwind compilato (`assets/tailwind.css`). Dopo aver usato nuove classi Tailwind in un `.html` o `.js`:
`cd tools && npm install && npm run build:css`, poi commit di `assets/tailwind.css`. L'unico servizio esterno rimasto sono le foto di esempio di Unsplash (landing e demo).

## Email all'amministratore per ogni nuovo listino
Quando un utente crea il proprio listino, Supabase chiama `api/notify-signup.js`, che invia un'email tramite Resend.
1. Crea un account su resend.com (con l'email che deve ricevere gli avvisi, finché non verifichi un dominio) e genera una **API key**.
2. Su Vercel → Settings → Environment Variables aggiungi: `RESEND_API_KEY`, `NOTIFY_WEBHOOK_SECRET` (una stringa lunga a caso) e `ADMIN_NOTIFY_EMAIL` (chi riceve; più indirizzi separati da virgola). Poi **Redeploy**.
3. Apri `supabase/notifica-admin.sql`, sostituisci `INCOLLA-QUI-IL-SEGRETO` con lo stesso valore di `NOTIFY_WEBHOOK_SECRET` ed eseguilo nello SQL Editor di Supabase.
4. **Cambiare l'email di destinazione:** modifica `ADMIN_NOTIFY_EMAIL` su Vercel e fai Redeploy. Nessun file da toccare. Senza dominio verificato in Resend, il destinatario può essere solo l'email con cui hai creato l'account Resend; per scrivere ad altri indirizzi verifica `listinorapido.it` in Resend e imposta `NOTIFY_FROM` (es. `ListinoRapido <avvisi@listinorapido.it>`).
5. Se il sito cambia indirizzo (es. www.listinorapido.it), cambia l'URL dentro `notifica-admin.sql` e rieseguilo.

## Se il browser blocca le richieste a Supabase (CORS / "Failed to fetch")
Il sito inoltra le richieste di Supabase anche da `/sb/...` (regola in `vercel.json`, con l'indirizzo del progetto Supabase). Se una richiesta diretta fallisce, `assets/store.js` la ripete una volta da lì, senza limiti di CORS; per i metodi che falliscono ricorda la scelta per la sessione. Se cambi progetto Supabase, aggiorna l'indirizzo anche in `vercel.json`.
