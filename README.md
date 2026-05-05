# Quantix Logistics

**Digitaalinen kuljetuksen ja tilauksen hallinta** — kokonaisuus, jossa asiakkaat käyvät verkkokaupassa, kuljettajat päivittävät toimituksia ja ylläpito näkee analytiikan. Sovellus on Metropolian **Full Stack -websovelluskehitys** -opintojaksoon tehty full stack -projektina (frontend + REST-API + MySQL).

Projektissa korostuu **läpinäkyvä toimitusketju**: tilausrjet, tilat, karttapohjainen seuranta ja ilmoitusvirta yhdessä järjestelmässä.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-5-000?logo=express&logoColor=fff" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-8%2B-4479A1?logo=mysql&logoColor=fff" alt="MySQL" />
</p>

---

## Sisältö

- [Projektiesityksen vaaditut kohdat](#projektiesityksen-vaaditut-kohdat)
- [Tausta ja kohde](#tausta-ja-kohde)
- [Käyttäjäroolit ja työnkulut](#käyttäjäroolit-ja-työnkulut)
- [Arkkitehtuuri](#arkkitehtuuri)
- [Teknologiapino](#teknologiapino)
- [REST API (moduulit)](#rest-api-moduulit)
- [Tietomalli](#tietomalli)
- [Frontend‑rakenne](#frontend‑rakenne)
- [Turvallisuus](#turvallisuus)
- [Linkit](#linkit)
- [Pika-aloitus](#pika-aloitus)
- [Ympäristömuuttujat](#ympäristömuuttujat)

---

## Projektiesityksen vaaditut kohdat

Tähän on koottu kurssin projektiesityksessä vaaditut sisällöt.

### 1) Ryhmän jäsenet

| Nimi | Rooli |
|------|-------|
| **Anders Nuri** | Frontend |
| **Jere Lappalainen** | Fullstack & Project Manager |
| **Teemu Poutanen** | Fullstack |
| **Satvik Velpola** | Backend |

### 2) Sovelluksen idea ja kohderyhmä

**Idea:** Quantix Logistics on tilaus- ja kuljetusketjun hallintasovellus. Se yhdistää verkkokauppamaisen tilauskokemuksen, kuljettajan operatiivisen näkymän sekä ylläpidon hallinta- ja analytiikkatyökalut.

**Kohderyhmä:**
- Yritys- ja kuluttaja-asiakkaat, jotka tilaavat tuotteita toimituksella
- Kuljettajat, jotka hallitsevat omia toimituksiaan
- Ylläpitäjät / operatiivinen tiimi, joka hallitsee tuotteita, käyttäjiä, tilauksia ja raportointia

### 3) Sovelluksen toiminnallisuudet

- Käyttäjähallinta ja roolipohjainen kirjautuminen (`customer`, `driver`, `admin`)
- Tuoteluettelo, ostoskori ja tilauksen luonti
- Tilausten tilan seuranta ja tilapäivitykset (asiakas-, kuljettaja- ja admin-näkymät)
- Kuljettajan toimitusnäkymä sekä karttapohjainen seuranta
- Adminin hallinta- ja analytiikkanäkymät (tuotteet, kategoriat, käyttäjät, raportointi)
- Ilmoitukset sekä rajapintapohjainen integraatiorakenne

### 4) Demo (alle 10 min)

Suositeltu demopolku esitykseen:
1. **Landing + kirjautuminen** eri rooleilla (1–2 min)
2. **Asiakkaan polku:** tuotteet → kori → checkout → omat tilaukset (2–3 min)
3. **Kuljettajan polku:** osoitetut toimitukset + kartta + tilapäivitys (2 min)
4. **Admin-polku:** tuotteiden/kategorioiden hallinta + analytiikka (2 min)
5. **Lopetus:** arkkitehtuuri + mistä testiohje löytyy README:stä (1 min)

### 5) Ohjeistus sovelluksen testaamiseen

Näillä askelilla löydät ja testaat keskeiset toiminnallisuudet:

1. Käynnistä backend ja frontend (`Pika-aloitus`-osion mukaan).
2. Rekisteröidy tai kirjaudu asiakkaana ja varmista:
   - tuotteet latautuvat
   - koriin lisääminen toimii
   - checkout luo tilauksen
3. Kirjaudu kuljettajana ja varmista:
   - osoitetut tilaukset näkyvät
   - tilan päivitys toimii
   - karttanäkymä ja seurantatieto päivittyvät
4. Kirjaudu adminina ja varmista:
   - käyttäjä-, tuote- ja kategoriatoiminnot toimivat
   - analytiikkanäkymät latautuvat ilman virheitä
5. Aja laatutarkistus:
   - `npm run verify` projektin juuresta (typecheck + build + backend-syntax-check)

---

## Tausta ja kohde

Projektissa rakennetaan **Quantix Logistics** ‑niminen ratkaisu, jonka käyttötapauksia kuvissa ovat käytännössä:

- ruoka- tai verkkokaupan tilauslogistiikkaan liittyvä **asiakastilaus**, kori ja checkout,
- kuljettajille osoitetut tilaukset sekä niiden tilan päivitys,
- kartalla näkyvä **reitti / koordinaattiseuranta**,
- hallinnolle **analytics-näkymät**, käyttäjät, tuotteet ja kategorioiden hallinta,

Työ pohjautuu reaalimaailman tapaan jaettuihin rajapintoihin: selain‑UI kutsuu yhtä **REST JSON ‑API:a**, joka jakaa lukuoikeudet käyttäjän roolin mukaan. Tämä sopii sekä oppimisolosuhteeseen että jatkokehitykseen samaan codebaseen.

Lähteet teknisille yksityiskohdille repon sisällä: [PROJECT_ANALYTICS.md](PROJECT_ANALYTICS.md) ja [BACKEND_DOCUMENTATION_INDEX.md](docs/backend/BACKEND_DOCUMENTATION_INDEX.md) *(API‑dokumentissa on noin 39 dokumentoitua endpointia; backend‑indeksin päivitys esimerkiksi toukokuussa 2026).*

---

## Käyttäjäroolit ja työnkulut

### Roolit

| Rooli       | Idea |
|------------|------|
| **customer**| Rekisteröityy tai kirjautuu, selaa tuotteita, rakentaa tilauksen ja seuraa omia lähetyksiään. |
| **driver**  | Näkee osoitetut toimitukset, päivittää tiloja, lähettää sijaintipäivityksiä seurantaan. |
| **admin**   | Tuotteet ja kategoriat, käyttäjät, tilaukset, analytiikka ja järjestelmäasetukset. |

### Tyypillinen polku

1. Asiakas tallentaa tilauksen (riveineen) → tilaus ja sen rivit **MySQL**‑tauluissa.  
2. Kuljettaja tai admin voi sitoa tilauksen kuljettajaan; tilat etenevät liiketoimintalogiikan mukaan.  
3. **DELIVERY_TRACKING** kerää sijaintitietoa; UI piirtää reitin ja markkerit **Leaflet**‑kartalla.  
4. **Ilmoitusjärjestelmä** täydentää tapahtumavirtaa (lisätään NOTIFICATIONS‑tasolle).  

Näitä polkuja tarkentavat sekä järjestelmäkaavio PROJECT_ANALYTICS‑dokissa että rajapintakuvaus API‑dokumentaatiossa.

---

## Arkkitehtuuri

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React, TypeScript, Vite, Tailwind)       │
│  • StoreRoot · DriverRoot · AdminRoot layouts       │
│  • Axios → /api                                      │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / JSON
┌────────────────────────▼────────────────────────────┐
│  Backend (Express 5 on Node.js)                     │
│  • JWT middleware + roleMiddleware                   │
│  • Moduulit: auth, products, orders, deliveries,   │
│    admin, categories, users, notifications         │
│  • Globaali rate limit /api‑polulle (GPS endpoint   │
│    voidaan rajata omalla säännöllä)                │
└────────────────────────┬────────────────────────────┘
                         │ mysql2 (promise)
┌────────────────────────▼────────────────────────────┐
│  MySQL — taulutus (katso DATABASE_SCHEMA)          │
│  USERS, PROFILES, PRODUCTS, ORDERS, TRACKING …      │
└─────────────────────────────────────────────────────┘
```

Toimituslogiikasta ja hakemistoista löytyy myös hakemistoanalytiikka: [PROJECT_ANALYTICS.md](PROJECT_ANALYTICS.md) kohdat *Architecture*, *Backend Structure*, *Frontend Structure*.

---

## Teknologiapino

Versiot kirjattu kunkin hakemiston **`package.json`**‑tiedostoon (semver‑range `^`; täsmällinen lukema `package-lock.json`issa).

### Frontend (`frontend/`)

| Alue | Teknologia |
|------|-------------|
| UI | React **19**, TypeScript **6**, Vite **8** |
| Tyyli | Tailwind CSS **4** (`@tailwindcss/vite`) |
| Reititys | React Router **7** |
| HTTP | Axios **1.15** |
| Kartat | Leaflet **1.9**, react-leaflet **5-rc**, MapLibre GL **5.24** |
| Komponentit | Radix UI, lukuisat primitiivit (dialog, sidebar, tabs, …) |
| Dataviz / animointi | Recharts **3.8**, Motion **12** |
| Muut | react-hook-form, lucide-react, sonner |

### Backend (`backend/`)

| Alue | Teknologia |
|------|-------------|
| Ajonaikainen | Node.js |
| Palvelin | Express **5.2** |
| Tietokanta | **mysql2** **3.20** (pool / promise) |
| Auth | **jsonwebtoken**, **bcrypt** |
| Muut | **cors**, **dotenv**, **express-rate-limit**, **nodemon** (kehitys) |

---

## REST API (moduulit)

Palvelin [mounttaa](backend/server.js) seuraavat polut **`/api`‑juureen** ‑tyyppisesti (tarkan polun löydät linkitetyistä reittitiedostoista):

| Polku | Sisältö (tiivistettynä dokumentaatiosta) |
|-------|------------------------------------------|
| `/api/auth` | Rekisteröinti, kirjautuminen, refresh, profiili, salasanan vaihto |
| `/api/products` | Tuotelistaukset (myös cursoreilla), CRUD‑hallinta adminille |
| `/api/orders` | Tilaukset asiakkaalle, kuljettajalle sekä hallinnan kokonaisuudet ja tilamuutokset |
| `/api/deliveries` | Kuljetuksen tilan lukeminen ja kuljettajan sijaintipäivitykset |
| `/api/admin` | Tulos‑ ja tilastografiikat, järjestelmä-/SMTP‑asetukset |
| `/api/categories` | Tuotekategorioiden listaus ja ylläpito |
| `/api/users` | Käyttäjähallinta (admin) |
| `/api/notifications` | Käyttäjäkohtaiset ilmoitukset |

**Kattava viite** (pyynnöt, vastaukset, roolit): [API_DOCUMENTATION.md](docs/backend/API_DOCUMENTATION.md)  
**Pikataulukko**: [API_QUICK_REFERENCE.md](docs/backend/API_QUICK_REFERENCE.md)  
**Testiesimerkit** (Postman/VS Code REST): [API_TESTING_GUIDE.md](docs/backend/API_TESTING_GUIDE.md) ja `backend/REST-CLIENT-TESTS/`.

---

## Tietomalli

Dokumentoidussa skeemassa on **11 päätaulua / näkymää**, esimerkiksi:

`USERS`, `CUSTOMER_PROFILES`, `DRIVER_PROFILES`, `PRODUCTS`, `CATEGORIES`, `PRODUCT_CATEGORIES`, `ORDERS`, `ORDER_ITEMS`, `DELIVERY_TRACKING`, `ANNOUNCEMENTS`, `NOTIFICATIONS`.

ER‑suhteet, enum‑arvot ja esimerkkikyselyt: **[DATABASE_SCHEMA.md](docs/backend/DATABASE_SCHEMA.md)**.

---

## Frontend‑rakenne

- **Kontekstit**: kirjautuminen (`AuthContext`), ostoskori, teema (`ThemeProvider`), toast‑palaute.
- **Layoutit**: erikseen kaupan (`StoreRoot`), kuljettajan (`DriverRoot`) ja hallinnan (`AdminRoot`) navigaatiolle.
- **Sivut**: mm. landing, kaupan tuotteet, kassa, asiakkaan dashboard, kuljettajan kartta ja tilaukset, admin‑dashboard ja analytiikka (katso `frontend/src/app/pages/` ja `routes.tsx`).
- **Komponentit**: jaettu `components/` (layout, delivery-tracking, UI‑kirjasto `ui/`).

Tarkempi hakemisto: [PROJECT_ANALYTICS.md](PROJECT_ANALYTICS.md) *(Frontend Structure)*.

---

## Turvallisuus

- **JWT** Bearer‑tokenissa; backend validoi ja kiinnittää `req.user`:iin middlewaressa.
- **Roolipohjainen käyttöoikeus** (`customer` / `driver` / `admin`) route‑tasolla.
- **CORS** rajattu `ALLOWED_ORIGINS`‑muuttujalla (oletuksena localhost‑Vite).
- **Globaali pyyntörajoitin** `/api`‑poluilla (`express-rate-limit`); GPS‑polkuja voidaan jättää kevyemmälle rajalle palvelimen konfiguraatiossa.

Tokenin säilytys selaimessa dokumentoidaan käyttämään **`quantix_token`**‑avainta (katso backend‑indeksi).

---

## Linkit

| Kuvaus | Osoite |
|--------|--------|
| GitHub‑repo | [github.com/XucyXi/web-project](https://github.com/XucyXi/web-project) |
| Dokumentaatio‑indeksi | [BACKEND_DOCUMENTATION_INDEX.md](docs/backend/BACKEND_DOCUMENTATION_INDEX.md) |
| Kokonaisanalytiikka | [PROJECT_ANALYTICS.md](PROJECT_ANALYTICS.md) |
| **Frontend (julkaisu)** | [DEPLOYED SITE](https://logistics.quantixincorporated.com/) |

**Lähikehitys**

| Palvelu | URL |
|---------|-----|
| Vite dev | [http://localhost:5173](http://localhost:5173) |
| Express | [http://localhost:3000](http://localhost:3000) |
| API‑juuri | [http://localhost:3000/api](http://localhost:3000/api) |

**Kartoissa hyödennetyt palvelut**

- [Leaflet](https://leafletjs.com/) (karttatiilet)  
- [OSRM](https://router.project-osrm.org/) (esimerkkireititys)  
- [Nominatim](https://nominatim.org/) (geokoodaus `backend/utils/geocoder.js`:ssä)  

---

## Pika-aloitus

```bash
# 1) Asenna molemmat npm-projektit (juuri)
npm run install:all

# 2) Backend: luo .env (DB, JWT, portti, ALLOWED_ORIGINS — ks. alla)
cd backend
npm run db:init
npm start

# 3) Frontend (uusi terminaali)
cd frontend
npm run dev
```

**Laatu ennen pushia (juuri)**

```bash
npm run verify    # typecheck + frontend build + backend syntaksitarkistus
```

---

## Ympäristömuuttujat

- **Backend**: tietokantayhteys, `JWT_SECRET`, `PORT`, `ALLOWED_ORIGINS` (pilkuilla erotettu lista sallituista origineista). Älä commitoi `.env`‑tiedostoa (`.gitignore` kattaa sen).
- **Frontend**: `VITE_API_BASE_URL` ohjaa Axiosin kantapolun tuotantoon; kehityksessä [Vite proxy](frontend/vite.config.ts) voi ohjata `/api` → `localhost:3000`.

Tarkemmat kentät ja esimerkit: [API_TESTING_GUIDE.md](docs/backend/API_TESTING_GUIDE.md) ja [BACKEND_DOCUMENTATION_INDEX.md](docs/backend/BACKEND_DOCUMENTATION_INDEX.md).

---

## Repun hakemisto

```
web-project/
├── frontend/              # React + Vite
├── backend/               # Express + MySQL
├── docs/backend/          # API- ja tietokantadokumentaatio
├── PROJECT_ANALYTICS.md   # Syvällinen rakenne- ja riippuvuusanalyysi
├── package.json           # Juuriscriptit (install:all, build, verify)
└── README.md              # Tämä tiedosto
```

---

## Kehityshaarat

Sovellusta kehitetään tyypillisesti **`dev`‑haarassa**; **`main`** toimii vakautettuna vertailupisteenä. README kuvaa repossa olevan toteutuksen; yksityiskohtaiset integraatiorungot voivat elää aktiivisimmassa haarassa.

---

## Lisenssi ja tekijät

Opiskelijaprojekti Metropolia AMK. Contributoorit: [GitHub contributors](https://github.com/XucyXi/web-project/graphs/contributors).
