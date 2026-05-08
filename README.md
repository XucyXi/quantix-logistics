# Quantix Logistics

**Digitaalinen kuljetuksen ja tilauksen hallinta** kokonaisuus, jossa asiakkaat käyvät verkkokaupassa, kuljettajat päivittävät toimituksia ja ylläpito näkee analytiikan. Sovellus on Metropolian **Full Stack -websovelluskehitys** -opintojaksoon tehty full stack -projektina (frontend + REST-API + MySQL).

Projektissa korostuu **läpinäkyvä toimitusketju**: tilausrivit, tilat, karttapohjainen seuranta ja ilmoitusvirta yhdessä järjestelmässä.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-5-000?logo=express&logoColor=fff" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-8%2B-4479A1?logo=mysql&logoColor=fff" alt="MySQL" />
</p>

---

## 1. Projektin kuvaus

### Mikä on Quantix Logistics? (Idea)

Quantix Logistics on moderni tilaus- ja kuljetusketjun hallintasovellus. Se yhdistää verkkokauppamaisen tilauskokemuksen, kuljettajan operatiivisen näkymän sekä ylläpidon hallinta- ja analytiikkatyökalut yhteen saumattomaan käyttöliittymään.

### Kenelle se on tehty? (Kohderyhmä)

- **Asiakkaat (B2B/B2C):** Käyttäjät, jotka tilaavat tuotteita ja haluavat seurata toimituksen etenemistä reaaliajassa.
- **Kuljettajat:** Logistiikkahenkilöstö, joka hallitsee omia toimituksiaan ja navigoi kohteisiin.
- **Ylläpito (Admin):** Operatiivinen tiimi, joka hallitsee tuotteita, käyttäjiä, tilauksia ja seuraa järjestelmän analytiikkaa.

### Miksi sovellus on hyödyllinen?

Nykyajan logistiikassa läpinäkyvyys on kaikki kaikessa. Järjestelmämme ratkaisee ongelman, jossa tieto katkeaa varaston ja asiakkaan välillä. Tarjoamalla asiakkaalle **live-karttaseurannan** ja kuljettajalle helpon mobiilinäkymän, vähennämme epätietoisuutta ja asiakaspalvelun kuormitusta. Roolipohjainen arkkitehtuuri on tehty skaalautuvaksi reaalimaailman tarpeisiin.

---

## 2. Ryhmän jäsenet

| Nimi                 | Rooli                       |
| -------------------- | --------------------------- |
| **Anders Nuri**      | Frontend                    |
| **Jere Lappalainen** | Fullstack & Project Manager |
| **Teemu Poutanen**   | Fullstack                   |
| **Satvik Velpola**   | Backend                     |

---

## 3. Keskeiset ominaisuudet

- **Käyttäjähallinta:** Roolipohjainen turvallinen kirjautuminen (JWT).
- **Asiakkaalle:** Tuoteluettelo, ostoskori, tilauksen luonti ja omien tilausten reaaliaikainen seuranta.
- **Kuljettajalle:** Osoitettujen toimitusten näkymä, tilapäivitykset ja **GPS-seuranta** kartalla.
- **Adminille:** Tuotteiden, kategorioiden ja käyttäjien CRUD-hallinta sekä visuaalinen analytiikkapaneeli (Recharts).
- **Integraatiot:** Leaflet-pohjainen live-kartta ja sisäinen ilmoitusjärjestelmä.

---

## 4. Ohjeistus testaamiseen (Vertaisarvioijille)

Voit testata sovellusta vapaasti livenä osoitteessa:
👉 **[logistics.quantixincorporated.com](https://logistics.quantixincorporated.com/)**

### Testitunnukset

Voit rekisteröidä oman asiakastunnuksen tai käyttää näitä valmiita testitunnuksia päästäksesi kiinni eri roolien näkymiin:

- **Asiakas:** `example@customer.com` | Salasana: `example123`
- **Kuljettaja:** `example@driver.com` | Salasana: `exampleDriver123`
- **Admin:** `example@admin.com` | Salasana: `exampleAdmin123`

### Suositeltu testauspolku (Demo)

Tätä polkua seuraamalla näet kaikki järjestelmän päätoiminnallisuudet:

1. **Kirjaudu asiakkaana:** Selaa tuotteita, lisää niitä ostoskoriin ja vie tilaus loppuun (Checkout). Tarkista, että tilaus ilmestyy "Tilaukset"-välilehdelle.
2. **Kirjaudu adminina:** Mene "Tilaukset"-sivulle. Voit halutessasi muuttaa juuri tekemäsi tilauksen tilaksi _Assigned_ ja ohjata sen testikuljettajalle. Tutki samalla analytiikkanäkymää.
3. **Kirjaudu kuljettajana:** Etsi äsken tehty tilaus "Odottaa toimitusta" -listalta. Kuittaa tilaus tilaan **"Matkalla"**. Mene Kartta-välilehdelle (voit käyttää "Simuloi ajo" -nappia oikeassa yläkulmassa nähdäksesi ajoreitin livenä).
4. **Live-seuranta:** Jos avaat toisella selaimella asiakkaan näkymän ja katsot kyseistä tilausta, näet kuljettajan sijainnin päivittyvän kartalla reaaliajassa!

### Palautelomake

Kun olet testannut sovelluksen, pyydämme ystävällisesti täyttämään vertaisarviointilomakkeen tänne:
👉 **[LINKKI GOOGLE FORMS -PALAUTELOMAKKEESEEN TÄHÄN]**

---

## 5. Asennus- ja pika-aloitusohjeet (Lokaalisti)

Jos haluat ajaa ohjelmistoa omalla koneellasi lähdekoodista, toimi näin:

**1. Kloonaa repositorio ja asenna riippuvuudet**

```bash
git clone [https://github.com/XucyXi/web-project.git](https://github.com/XucyXi/web-project.git)
cd web-project
npm run install:all

```

**2. Tietokannan pystytys (Backend)**

- Luo paikalliselle MySQL-palvelimellesi tyhjä tietokanta.
- Kopioi `backend/.env.example` nimelle `backend/.env` ja täytä tietokantasi tunnukset sekä valitsemasi `JWT_SECRET`.
- Alusta tietokannan taulut:

```bash
cd backend
npm run db:init

```

**3. Käynnistä palvelimet**

- **Backend:** (Kansiossa `backend/`) aja komento `npm start`
- **Frontend:** (Kansiossa `frontend/`) aja komento `npm run dev`

Sovellus pyörii nyt osoitteessa `http://localhost:5173`.

> Vinkki: Ennen uusia commit-työntöjä voit tarkistaa laadun ajamalla projektin juuresta `npm run verify` (typecheck + build + syntax check).

---

## 6. Arkkitehtuuri ja Teknologiapino

Selain-UI kutsuu yhtä **REST JSON -APIa**, joka jakaa lukuoikeudet käyttäjän roolin mukaan JWT-tokenin avulla.

```text
┌─────────────────────────────────────────────────────┐
│  Frontend (React 19, TypeScript, Vite, Tailwind 4)  │
│  • StoreRoot · DriverRoot · AdminRoot layouts       │
│  • Axios → /api                                     │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / JSON
┌────────────────────────▼────────────────────────────┐
│  Backend (Express 5 on Node.js)                     │
│  • JWT middleware + roleMiddleware                  │
│  • Moduulit: auth, products, orders, deliveries...  │
└────────────────────────┬────────────────────────────┘
                         │ mysql2 (promise)
┌────────────────────────▼────────────────────────────┐
│  MySQL — (Käyttäjät, Tuotteet, Tilaukset, GPS...)   │
└─────────────────────────────────────────────────────┘

```

**REST API -moduulit (/api/...)**

- `/auth` - Rekisteröinti, kirjautuminen, refresh
- `/products` & `/categories` - Tuoteluettelot ja CRUD
- `/orders` - Tilausten luonti ja tilamuutokset
- `/deliveries` - GPS-sijaintipäivitykset ja lukeminen
- `/admin` & `/users` - Tilastot ja käyttäjähallinta

Kattava rajapintakuvaus löytyy: [API_DOCUMENTATION.md](https://www.google.com/search?q=docs/backend/API_DOCUMENTATION.md)

---

## 7. Tietomalli

Dokumentoidussa skeemassa on 11 päätaulua, mm: `USERS`, `CUSTOMER_PROFILES`, `DRIVER_PROFILES`, `PRODUCTS`, `ORDERS`, `DELIVERY_TRACKING` ja `NOTIFICATIONS`. Tarkat ER-suhteet ja esimerkkikyselyt löytyvät täältä: [DATABASE_SCHEMA.md](https://www.google.com/search?q=docs/backend/DATABASE_SCHEMA.md).

<img src="https://i.imgur.com/fZO3ftr.png">

---

## 8. Linkit ja Repositorion rakenne

- **Frontend (Tuotanto):** [https://logistics.quantixincorporated.com/](https://logistics.quantixincorporated.com/)
- **Kokonaisanalytiikka:** [PROJECT_ANALYTICS.md](https://www.google.com/search?q=PROJECT_ANALYTICS.md)
- **Kartoissa hyödynnetyt palvelut:** [Leaflet](https://leafletjs.com/), [OSRM](https://router.project-osrm.org/), [Nominatim](https://nominatim.org/)

```text
web-project/
├── frontend/              # React + Vite käyttöliittymä
├── backend/               # Express + MySQL palvelin
├── docs/backend/          # API- ja tietokantadokumentaatio
├── PROJECT_ANALYTICS.md   # Syvällinen rakenne- ja riippuvuusanalyysi
└── package.json           # Juuriscriptit (install:all, build, verify)

```

**Lisenssi:** Opiskelijaprojekti Metropolia AMK.
Contributoorit: [GitHub contributors](https://github.com/XucyXi/quantix-logistics/graphs/contributors).
