# S1NNEX INDUSTRIES

FiveM Fraktions-Webseite mit Bestellsystem und Discord-Webhook.

## Funktionen

- Übersicht
- Produktkatalog
- Aktuelle Preisliste
- Bestellsystem
- Automatische Bestellnummer
- Preisberechnung
- Discord-Benachrichtigung
- Responsive Design
- Vercel API
- GitHub Pages kompatibel

---

# Produkte

| Produkt | Preis |
|---|---:|
| Eisenerz | 80$ |
| Metall | 140$ |
| Carbon | 120$ |
| Eisen | 120$ |
| Aramidfasern | 80$ |
| Schutzplatten | 1.200$ |
| Hülsen | 80$ |
| Schwarzpulver | 80$ |

---

# Einrichtung

## 1. GitHub

Alle Dateien in ein neues Repository hochladen.

Beispiel:

S1NNEX-INDUSTRIES

---

## 2. Vercel

Das Repository zusätzlich mit Vercel verbinden.

Vercel verwendet die Datei:

api/order.js

als Serverless API.

---

## 3. Discord Webhook

In Vercel unter:

Project
→ Settings
→ Environment Variables

folgende Variable erstellen:

DISCORD_WEBHOOK_URL

Als Wert den neuen Discord Webhook eintragen.

NICHT in GitHub eintragen.

---

## 4. CORS

Zusätzlich folgende Variable erstellen:

ALLOWED_ORIGIN

Beispiel:

https://DEINNAME.github.io

Wenn GitHub Pages unter einem Repository läuft:

https://DEINNAME.github.io/REPOSITORY

---

## 5. API URL

In:

script.js

diese Zeile ändern:

const API_URL =
    "https://DEIN-PROJEKT.vercel.app/api/order";

Beispiel:

const API_URL =
    "https://s1nnex-industries.vercel.app/api/order";

---

## 6. Deploy

Nach Änderungen Vercel neu deployen.

Environment Variables müssen für die entsprechende Umgebung gesetzt sein und Änderungen daran erfordern einen neuen Deploy. 

---

# Sicherheit

Der Discord Webhook darf niemals in:

- index.html
- script.js
- katalog.html
- bestellung.html
- GitHub

stehen.

Der Webhook wird ausschließlich serverseitig über:

process.env.DISCORD_WEBHOOK_URL

geladen.
