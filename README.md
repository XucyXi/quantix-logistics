# web-project
Web-project for the Metropolia's Web-coding course.

Tässä on pyytämäsi README.md käännettynä suomeksi. Jätin koodilohkot ja yleisimmät ohjelmistoalan termit (kuten *frontend*, *backend*, *mock*, *stub*) alkuperäiseen muotoonsa, sillä niitä käytetään sellaisenaan myös suomenkielisessä kehitystyössä.

***

# Quantix Logistics - Viimeistelyn README

Tämä README on toteutusopas (playbook) projektin viimeistelemiseksi `dev`-haarassa. Se on kirjoitettu niin, että kehittäjät voivat heti valita tehtäviä ja aloittaa koodaamisen.

## Tavoite

Julkaista tuotantovalmis full-stack-sovellus korjaamalla integraatiopuutteet seuraavien välillä:
- `frontend` (React + Vite + TypeScript)
- `backend` (Express + MySQL)

## Nykytilanne (lyhyesti)

`dev`-haarassa tunnistetut suurimmat esteet (blockerit):
- Frontendin ja backendin API-etuliitteet ovat epäyhtenäiset (`/api/v1` vs `/api`).
- Frontend odottaa päätepisteitä (endpoints), joita backend ei vielä tarjoa.
- `backend/routes/adminRoutes.js` on olemassa, mutta sitä ei ole liitetty (mounted) tiedostossa `backend/server.js`.
- Frontendistä puuttuu reittitiedoston tuontikohde (`StoresPage`).
- Mock/stub-toiminnallisuuksia on yhä tunnistautumis-, kassa- ja ilmoitusvirroissa.
- Tiukat julkaisuporttiskriptit (lint/typecheck/test) ja CI-työnkulku puuttuvat.

---

## Prioriteettisuunnitelma

### Pakolliset ennen julkaisua (Must-have)

1. Yhtenäistä API:n peruspolku ja päätepistesopimukset.
2. Liitä ja toteuta kaikki frontendin käyttämät backend-reitit.
3. Korvaa mock-tunnistautuminen oikealla API-pohjaisella tunnistautumisella.
4. Korjaa puuttuva `StoresPage`-reitin ja tiedoston epäsuhta.
5. Lisää lint-, typecheck- ja test-skriptit; suorita ne sitten CI:ssä.
6. Poista stubit kriittisistä liiketoimintavirroista (kassa, ilmoitukset, asetukset).

### Suositeltavat (Should-have)

1. Lisää backendin pyyntöjen validointi ja yhtenäinen API-virheformaatti.
2. Poista arkaluontoinen debug-lokitus.
3. Lisää `.env.example` ja asennusohjeet.
4. Vahvista turvallisuuden oletusasetuksia (ei varajärjestelmän JWT-salaisuutta).

---

## Toteutustehtävät kopioitavalla aloituskoodilla

Käytä näitä malleja lähtökohtana. Mukauta nimet ja tyypit nykyiseen koodikantaasi tarpeen mukaan.

### 1) Backend: liitä `admin`-reitit tiedostossa `backend/server.js`

Jos `adminRoutes.js` on olemassa mutta sitä ei ole liitetty, lisää:

```js
// backend/server.js
const adminRoutes = require('./routes/adminRoutes');

// ... olemassa olevat app.use -kutsut
app.use('/api/admin', adminRoutes);
```

Varmista myös, että tunnistautumis- ja roolimiddlewarea käytetään tiedoston `adminRoutes.js` sisällä:

```js
// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get(
  '/analytics/revenue',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  analyticsController.getRevenueStats
);

router.get(
  '/analytics/orders',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('admin'),
  analyticsController.getOrderStats
);

module.exports = router;
```

---

### 2) Backend: lisää puuttuva analytiikka-kontrolleri

```js
// backend/controllers/analyticsController.js
const pool = require('../config/db');

async function getRevenueStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        COALESCE(SUM(total_price), 0) AS total_revenue,
        COUNT(*) AS total_orders,
        COALESCE(AVG(total_price), 0) AS avg_order_value,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders
      FROM ORDERS
      WHERE ordered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    return res.json({ success: true, stats: rows[0] });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue stats',
      error: error.message,
    });
  }
}

async function getOrderStats(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM ORDERS
      GROUP BY status
    `);

    return res.json({ success: true, stats: rows });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order stats',
      error: error.message,
    });
  }
}

module.exports = {
  getRevenueStats,
  getOrderStats,
};
```

---

### 3) Backend: lisää asiakkaan tilaukset -päätepiste sivutuksella

```js
// backend/services/orderService.js
async function getOrdersByCustomerId(customerId, { limit = 20, offset = 0, status } = {}) {
  let query = `
    SELECT o.order_id, o.status, o.delivery_address, o.total_price, o.ordered_at
    FROM ORDERS o
    WHERE o.customer_id = ?
  `;
  const params = [customerId];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.ordered_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);
  return rows;
}
```

```js
// backend/controllers/orderController.js
async function getCustomerOrders(req, res) {
  try {
    const customerId = req.user.user_id;
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);
    const status = req.query.status || undefined;

    const orders = await orderService.getOrdersByCustomerId(customerId, {
      limit,
      offset,
      status,
    });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error.message,
    });
  }
}
```

```js
// backend/routes/orderRoutes.js
router.get(
  '/my-orders',
  authMiddleware.authenticate,
  roleMiddleware.requireRole('customer'),
  orderController.getCustomerOrders
);
```

---

### 4) Frontend: yhtenäistä API-asiakkaan perus-URL (`frontend/src/app/lib/api.ts`)

Valitse yksi standardi (suositus: `/api`) ja käytä sitä kaikkialla.

```ts
// frontend/src/app/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('quantix_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Lisää vastaava ympäristömuuttuja frontendiin:

```env
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:3000/api
```

---

### 5) Frontend: poista mock-tunnistautuminen ja kutsu oikeaa backendia

```ts
// frontend/src/app/contexts/AuthContext.tsx (esimerkki palvelun käytöstä)
import api from '../lib/api';

async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', data.token);
  setUser(data.user);
}

async function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  await api.post('/auth/register', payload);
}
```

Poista kovakoodatut mock-käyttäjät/tokenit sen jälkeen, kun oikea tunnistautuminen toimii.

---

### 6) Frontend: korjaa puuttuva `StoresPage`

Jos reitti on olemassa tiedostossa `frontend/src/app/routes.tsx`, luo tiedosto:

```tsx
// frontend/src/app/pages/StoresPage.tsx
export default function StoresPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold">Stores</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        TODO: Implement real store listing and details.
      </p>
    </section>
  );
}
```

Jos et tarvitse tätä reittiä, poista sen tuonti ja reittimäärittely sen sijaan.

---

### 7) Backend: korvaa ilmoitusten stub

```js
// backend/services/notificationService.js
async function sendOrderNotification({ userId, message, channel = 'email' }) {
  // TODO: integroi oikea palveluntarjoaja (SendGrid/Twilio/jne.)
  // Pidä rajapinta vakaana, jotta kontrollerikoodia ei tarvitse muuttaa myöhemmin.
  console.info('[notification]', { userId, channel, message });
  return { success: true };
}

module.exports = { sendOrderNotification };
```

Käytä tätä tilauksen tilan päivitysvirrassa:

```js
await notificationService.sendOrderNotification({
  userId: customerId,
  message: `Order ${orderId} status changed to ${newStatus}`,
});
```

---

## Julkaisuporttiskriptit (lisää nyt)

### `frontend/package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

### `backend/package.json`

```json
{
  "scripts": {
    "start": "node server.js",
    "db:init": "node config/init.js",
    "lint": "eslint .",
    "test": "jest --runInBand"
  }
}
```

Jos test/lint-riippuvuuksia ei ole vielä asennettu, lisää ne ensin:

```bash
# frontend
npm i -D vitest @testing-library/react @testing-library/jest-dom eslint

# backend
npm i -D jest supertest eslint
```

---

## CI-aloituspohja (GitHub Actions)

Luo `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, dev]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --passWithNoTests
```

---

## Valmiin määritelmä (Definition of Done, DoD)

Projekti on valmis, kun kaikki seuraavat ehdot täyttyvät:
- [ ] Frontendin kirjautumis-, rekisteröitymis- ja tilaussivut toimivat oikeaa backend-dataa vasten.
- [ ] Kriittisissä käyttäjävirroissa ei ole mock-tunnistautumista tai -tilausdataa.
- [ ] Kaikki vaaditut backend-päätepisteet ovat olemassa ja palauttavat yhtenäistä JSON-formaattia.
- [ ] `npm run build` onnistuu frontendissä.
- [ ] Backend käynnistyy ilman varajärjestelmän salaisuuksia (fallback secrets) ja ilman käynnistysvirheitä.
- [ ] Lint/typecheck/test-komennot menevät läpi paikallisesti ja CI:ssä.
- [ ] `.env.example` on olemassa frontendille ja backendille.
- [ ] Selaimen verkkolokeissa ei näy kriittisiä 4xx/5xx-virheitä ydinvirtojen aikana.

---

## Ehdotettu suoritusjärjestys (1 sprintti)

1. API-sopimusten yhtenäistäminen (`/api`-strategia).
2. Backend-päätepisteiden viimeistely ja reittien liittäminen.
3. Frontendin tunnistautumis- ja tilausvirtojen vaihtaminen mockista oikeaan API:in.
4. Käännösesteiden korjaaminen (`StoresPage`-reitin epäsuhta).
5. Test/lint/typecheck-skriptien ja CI:n lisääminen.
6. Lopullinen end-to-end-savutesti (smoke test) ja bugikorjauskierros.

---

## Pika-aloituskomennot

```bash
# backend
cd backend
npm install
npm run db:init
npm start
```

```bash
# frontend
cd frontend
npm install
npm run dev
```

Tämän jälkeen varmista:
- API:n tila (health) ja kirjautuminen toimivat frontendistä.
- Asiakkaan tilauslista latautuu.
- Admin-analytiikka latautuu.
- Konsolissa tai verkkovälilehdellä ei ole kriittisiä virheitä.
