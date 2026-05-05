# Quantix Logistics

**Ruokakaupan logistiikka-alusta** — kokonaisratkaisu tilauksista, toimitusketjusta ja seurannasta. Projektina full-stack -sovellus Metropolian web-kurssin yhteydessä.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-000?logo=express&logoColor=fff" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=fff" alt="MySQL" />
</p>

<p align="center">
  <sub>React · TypeScript · Vite · Express · MySQL · Leaflet</sub>
</p>

---

## 🔗 Linkit

| Mitä | Missä |
|------|--------|
| **Lähdekoodi (GitHub)** | [github.com/XucyXi/web-project](https://github.com/XucyXi/web-project) |
| **Frontend (live)** | _Päivitä tähän julkaistu URL (esim. Vercel / Netlify / Azure Static Web Apps)_ |
| **Backend / API (live)** | _Päivitä tähän julkaistu API:n kantava URL_ |
| **API-dokumentaatio (repo)** | [docs/backend/API_DOCUMENTATION.md](docs/backend/API_DOCUMENTATION.md) |
| **Nopea API-viite** | [docs/backend/API_QUICK_REFERENCE.md](docs/backend/API_QUICK_REFERENCE.md) |
| **Tietokantakuvaus** | [docs/backend/DATABASE_SCHEMA.md](docs/backend/DATABASE_SCHEMA.md) |
| **Projektikatsaus / analytiikka** | [PROJECT_ANALYTICS.md](PROJECT_ANALYTICS.md) |

**Lähikehitys (oletus):**

| Palvelu | Osoite |
|---------|--------|
| Frontend (Vite) | [http://localhost:5173](http://localhost:5173) |
| Backend (Express) | [http://localhost:3000](http://localhost:3000) |
| REST API -juuri | [http://localhost:3000/api](http://localhost:3000/api) |

**Kartoissa käytetyt ulkoiset palvelut:**

- [OpenStreetMap](https://www.openstreetmap.org/) — karttatiilet  
- [OSRM demo-reititys](https://router.project-osrm.org/) — reittiviivat sovelluksessa  
- [Nominatim](https://nominatim.org/) — geokoodaus ( osoitteet → koordinaatit )

---

## Mistä tässä on kyse?

**Quantix Logistics** simuloi tai tukee **ruokalähetyksen** kokonaisuutta:

- kaupassa **selaillaan tuotteita** ja rakennetaan **tilauksia**,
- järjestelmä jakaa käyttöroolit **asiakkaalle**, **kuskeille** ja **ylläpitäjälle**,
- kuskit ja hallinta näkevät **toimituksen kulun** kartalla ja tilalistoina.

Sovellus ei ole vain yksi näkymä: se on jaettu selkeisiin kokonaisuuksiin (kauppa vs. kuski vs. hallinta), mutta sama koodihaara ja sama API pitävät datan synkassa.

---

## Ominaisuudet

- 🔐 **Roolipohjainen käyttö** — asiakas, kuljettaja, admin omiin näkymiinsä  
- 🛒 **Tuotteet ja tilauspolku** — katalogi, kori, kassaprosessi  
- 📦 **Tilausten hallinta** — tilat, seuranta, asiakkaan oma dashboard  
- 🚚 **Kuljettajan työkalut** — reitit, kartta, toimitusten päivitys  
- 📊 **Hallintanäkymät** — analytiikkaa ja operatiivista tietoa  
- 🗺️ **Kartat & sijainti** — reaaliaikainen / lähes reaaliaikainen seuranta Leaflet-pohjaisilla näkymillä  
- 🌓 **Teema** — vaalea / tumma käyttöliittymän kautta  

---

## Teknologiat

| Kerros | Teknologia |
|--------|------------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, React Router, Axios, Leaflet / MapLibre, Recharts, Motion |
| **Backend** | Node.js, Express 5, mysql2, JWT, bcrypt |
| **Tietokanta** | MySQL |
| **Työkalut** | ESLint, Prettier |

---

## Repun rakenne

```
web-project/
├── frontend/          # React + Vite (UI, reititys, palvelut)
├── backend/           # Express API, palvelut, SQL
├── docs/backend/      # API- ja tietokantadokumentaatio
├── PROJECT_ANALYTICS.md
└── package.json       # Juuriscriptit (asennus + verify)
```

---

## Pika-aloitus

### 1. Asenna riippuvuudet (juuresta)

```bash
npm run install:all
```

### 2. Tietokanta ja ympäristö

Luo `backend/.env` (DB-yhteys, salaisuudet). Katso vinkit: [docs/backend/BACKEND_DOCUMENTATION_INDEX.md](docs/backend/BACKEND_DOCUMENTATION_INDEX.md) ja [docs/backend/API_TESTING_GUIDE.md](docs/backend/API_TESTING_GUIDE.md).

```bash
cd backend
npm run db:init
npm start
```

Toisessa terminaalissa:

```bash
cd frontend
npm run dev
```

### 3. Tuotantobuildi ja tarkistukset (juuresta)

```bash
npm run build      # frontend → dist/
npm run verify     # typecheck + build + backend-syntaksitarkistus
```

**Frontendin API-osoite** voidaan antaa ympäristömuuttujalla, esim. `VITE_API_BASE_URL` (katso [frontend/vite.config.ts](frontend/vite.config.ts) ja `api`-client).

---

## Dokumentaatio

| Tiedosto | Sisältö |
|----------|---------|
| [API_DOCUMENTATION.md](docs/backend/API_DOCUMENTATION.md) | Endpointit ja sopimukset |
| [API_QUICK_REFERENCE.md](docs/backend/API_QUICK_REFERENCE.md) | Pikakääntö |
| [API_TESTING_GUIDE.md](docs/backend/API_TESTING_GUIDE.md) | Testipyynnöt ja esimerkit |
| [DATABASE_SCHEMA.md](docs/backend/DATABASE_SCHEMA.md) | Taulut ja relaatiot |
| [BACKEND_DOCUMENTATION_INDEX.md](docs/backend/BACKEND_DOCUMENTATION_INDEX.md) | Hakemisto |
| [PROJECT_ANALYTICS.md](PROJECT_ANALYTICS.md) | Kokonaissanalytiikka, riippuvuudet |

---

## Kehitys haaroinnin ja integraatioiden kimpussa?

Pisin **checklist ja copy-paste -pätkät** julkaisuvalmiutta varten elävät usein haarassa `dev` ja historiaversiossa tästä reposta. Aktiivinen integraatiorumpu: yhtenäinen `/api`-sopimus, kirjautuminen kiinni oikeaan palvelimeen sekä julkaisu- ja CI-valmius.

---

## Lisenssi & tekijät

Opiskelijaprojekti. Katso lisäykset GitHubissa: [contributors](https://github.com/XucyXi/web-project/graphs/contributors).
