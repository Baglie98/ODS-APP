# ODS Catering Master

Gestione Ordini di Servizio per catering: ODS modello completo a fonte unica e viste derivate per Capo Servizio, Brigata, Carico & Facchinaggio e In Servizio. App web installabile (PWA), funziona offline; i dati restano sul dispositivo (localStorage), con backup/ripristino via file JSON.

## Requisiti

Node.js 20+ (oppure Bun).

## Sviluppo

```bash
npm install        # oppure: bun install
npm run dev        # http://localhost:3000
```

## Build di produzione

```bash
npm run lint       # controllo tipi TypeScript
npm run build      # genera la cartella dist/
npm run preview    # serve dist/ su http://localhost:4173
```

`dist/` è un sito statico: si pubblica così com'è su Vercel, Netlify, Cloudflare Pages, GitHub Pages o qualunque web server. Serve HTTPS perché l'installazione come WebApp e il funzionamento offline siano attivi.

## Dati

- Gli ODS sono salvati nel browser del dispositivo: non si sincronizzano tra dispositivi diversi.
- Menu ⋮ → **Backup Archivio (JSON)** per esportare, **Importa Archivio** per ricaricare (gli ODS con lo stesso ID vengono sovrascritti, non duplicati).
- Menu ⋮ → **Elimina ODS Corrente** per rimuovere un ordine.
