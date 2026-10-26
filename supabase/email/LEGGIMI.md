# Email di sistema in italiano (Supabase Auth)

Incolla ogni file in **Supabase → Authentication → Emails (Email Templates)**: il campo *Subject* con l’oggetto indicato e il campo *Message body* (modalità sorgente/HTML) con il contenuto del file.

- `conferma-registrazione.html` → oggetto: **Conferma la tua email – ListinoRapido**
- `reimposta-password.html` → oggetto: **Reimposta la password – ListinoRapido**
- `link-di-accesso.html` → oggetto: **Il tuo link di accesso – ListinoRapido**
- `cambio-email.html` → oggetto: **Conferma il cambio email – ListinoRapido**
- `invito.html` → oggetto: **Sei stato invitato su ListinoRapido**

Template di Supabase: "Confirm sign up" = conferma-registrazione, "Reset password" = reimposta-password, "Magic link" = link-di-accesso, "Change email address" = cambio-email, "Invite user" = invito.

## Cambiare il mittente ("Supabase Auth" → "ListinoRapido")
Il nome del mittente si cambia solo con un SMTP personalizzato. Con Resend:
1. Resend → Domains: aggiungi `listinorapido.it` e inserisci nel DNS del dominio i record che indica (DKIM, SPF); attendi lo stato *Verified*.
2. Resend → API Keys: crea una chiave (puoi riusare quella dell'avviso admin).
3. Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP:
   - Sender email: `noreply@listinorapido.it`
   - Sender name: `ListinoRapido`
   - Host: `smtp.resend.com` · Port: `465`
   - Username: `resend` · Password: la chiave API di Resend
4. Salva e prova con una nuova registrazione.
