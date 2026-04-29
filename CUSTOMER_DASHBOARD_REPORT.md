# 📊 CustomerDashboard Raportti - Status ja Puuttuvat Arvot

**Päiväys:** 29.04.2026
**Status:** 🟡 MVP valmis, API integraatio kesken
**PR:** #28 - feat: Lisätään asiakaspaneeli (CustomerDashboard)

---

## 1. ✅ Valmis Toteutus

### Frontend (CustomerDashboard.tsx)

| Komponentti             | Status | Kuvaus                                                    |
| ----------------------- | ------ | --------------------------------------------------------- |
| **Header**              | ✅     | Tervetuloa-tervehdys + kuvaus näkyy                       |
| **Tab Navigation**      | ✅     | Tilaukset / Asetukset välilehdet toimivat                 |
| **Tilin Yhteenveto**    | ✅     | Näytetään käyttäjän tiedot (email, puh, viimeksi kirjaus) |
| **Stat Cards**          | ✅     | 4 korttia: Yhteensä, Toimitettu, Odottaa, Kokonaiskulut   |
| **Filtterit**           | ✅     | Kaikki, Odottaa, Kuljetus, Toimitettu                     |
| **Order Cards**         | ✅     | Tilauksen näyttö status-merkinnöillä + osoite + hinta     |
| **Asetukset-välilehti** | ✅     | UI valmis (Tilin tiedot, Ilmoitukset, Turvallisuus)       |
| **Responsive Design**   | ✅     | Toimii mobile + desktop                                   |
| **Animaatiot**          | ✅     | Framer Motion käytetty (cards, tab transitions)           |

### Backend Rakenne

| Komponentti          | Status | Kuvaus                                                      |
| -------------------- | ------ | ----------------------------------------------------------- |
| **Database Schema**  | ✅     | USERS, ORDERS, ORDER_ITEMS, DELIVERY_TRACKING olemassa      |
| **Order Controller** | ✅     | createOrder, getOrder, getAssignedOrders, updateOrderStatus |
| **Order Service**    | ✅     | Database kyselyt implementoitu                              |
| **Order Routes**     | ✅     | API reitit määritelty                                       |
| **Auth Middleware**  | ✅     | JWT authentication olemassa                                 |

---

## 2. ❌ Puuttuvat Arvot ja API Endpointit

### Backend API - Puuttuvat Endpointit

#### 🔴 KRIITTINEN: GET /api/orders (asiakkaan tilaukset)

```javascript
// PUUTTUU! Asiakkaalle ei voi hakea omia tilauksia
router.get(
  '/',
  authMiddleware.authenticate,
  orderController.getCustomerOrders // ❌ EI IMPLEMENTOITU
);
```

**Mitä tarvitaan:**

```typescript
// Palauttaa asiakkaan kaikki tilaukset
GET /api/orders
Headers: { Authorization: "Bearer {token}" }

Response:
{
  success: true,
  orders: [
    {
      order_id: 1,
      status: "done",
      delivery_address: "...",
      total_price: 450.25,
      ordered_at: "2026-04-28T09:30:00Z",
      item_count: 3,
      driver_email: "driver@example.com"
    }
  ]
}
```

#### 🔴 KRIITTINEN: GET /api/orders/stats (tilastot)

```javascript
// PUUTTUU! Tilin Yhteenveto vaatii lasketut tilastot
router.get(
  '/stats',
  authMiddleware.authenticate,
  orderController.getOrderStats // ❌ EI IMPLEMENTOITU
);
```

**Mitä tarvitaan:**

```typescript
GET /api/orders/stats
Response:
{
  total_orders: 24,
  delivered_count: 22,
  pending_count: 2,
  in_transit_count: 0,
  total_spent: 2450.00,
  average_order_value: 451.25,
  delivery_speed_days: 8.4,
  success_rate: 91.7
}
```

#### 🟡 TOISSIJAINEN: PUT /api/orders/:id (tilauksen päivitys)

```javascript
// OSITTAIN OLEMASSA vain statusin päivitykselle
// Pitäisi sallia asiakkaalla osoitteen/noottien muokkaus

router.put(
  '/:id',
  authMiddleware.authenticate,
  orderController.updateOrder // ❌ ASIAKKAALLE
);
```

#### 🟡 TOISSIJAINEN: POST /api/orders/:id/cancel (peruutus)

```javascript
// PUUTTUU! Asiakka voisi peruuttaa pending tilauksia
router.post(
  '/:id/cancel',
  authMiddleware.authenticate,
  orderController.cancelOrder // ❌ EI IMPLEMENTOITU
);
```

---

## 3. ❌ Frontend API Integraatio - Puuttuvat Asiat

### A. API Service Layer (PUUTTUU KOKONAAN)

**Nykyinen tilanne:**

```typescript
// ❌ OLEMASSA: Mock data -> recentOrders array
const recentOrders: Order[] = [{ order_id: 1, ... }];
const [orders, setOrders] = useState<Order[]>(recentOrders);
```

**Mitä tarvitaan: src/services/orderService.ts**

```typescript
// ✅ API kutsut
const API_BASE = 'http://localhost:3000/api';

export const orderService = {
  // Asiakkaan tilaukset
  getCustomerOrders: async (token: string) => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return res.json();
  },

  // Tilastot
  getOrderStats: async (token: string) => {
    const res = await fetch(`${API_BASE}/orders/stats`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return res.json();
  },

  // Uusi tilaus
  createOrder: async (data: OrderData, token: string) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
```

### B. CustomerDashboard.tsx - useEffect puuttuu

**Nykyinen tilanne:**

```typescript
// ❌ EI KUTSUA BACKENDIA
export function CustomerDashboard() {
  const {user} = useAuth();
  const [orders, setOrders] = useState<Order[]>(recentOrders);  // ← Mock data
  const [loading, setLoading] = useState(false);

  // ❌ useEffect on olemassa mutta ei käytössä!
  // const [useEffect, ...] ei käytetä
```

**Mitä tarvitaan:**

```typescript
useEffect(() => {
  if (!user) return;

  setLoading(true);
  orderService
    .getCustomerOrders(authToken)
    .then((data) => {
      setOrders(data.orders);
      // Laske stat cards datasta
      const stats = calculateStats(data.orders);
      updateStatCards(stats);
    })
    .catch((err) => console.error('Tilausten haku epäonnistui:', err))
    .finally(() => setLoading(false));
}, [user]); // Riippuvuudet
```

### C. Authentication Token

**Nykyinen tilanne:**

```typescript
// ❌ AuthContext ei tallenna JWT tokenia
export function AuthProvider() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('quantix_user');
    return saved ? JSON.parse(saved) : null;
    // ❌ Token ei tallennettu!
  });
```

**Mitä tarvitaan:**

```typescript
// Tallenna JWT token
localStorage.setItem('quantix_token', jwtToken);

// Käytä API kutsuissa
const token = localStorage.getItem('quantix_token');
headers: {
  Authorization: `Bearer ${token}`;
}
```

### D. Error Handling & Loading States

**Nykyinen tilanne:**

```typescript
// ✅ Loading state on olemassa, mutta ei käytössä
const [loading, setLoading] = useState(false);

// ❌ Virheiden käsittely puuttuu
// ❌ Real-time polling puuttuu
```

---

## 4. 📋 UI Komponentit - Puuttuvat Toiminnallisuudet

### Settings-välilehti

| Toiminto                | Status | Huomio                                         |
| ----------------------- | ------ | ---------------------------------------------- |
| **"Uusi Tilaus" nappi** | ❌     | Ei navigoi, ei avaa formiaa                    |
| **"Näytä" nappi**       | ❌     | Ei avaa tilauksen yksityiskohtia               |
| **Tilin tiedot**        | ❌     | Input-kentät disabloitu, ei pysty muokkaamaan  |
| **Puhelinnumero**       | ⚠️     | Näytetään "Ei asetettu" - tietoa ei tallenneta |
| **Ilmoitus asetukset**  | ❌     | Checkboxit ei tallenneta backendiin            |
| **Vaihda Salasana**     | ❌     | Nappi ei toimi                                 |
| **Poista Tili**         | ❌     | Nappi ei toimi                                 |

---

## 5. 🗄️ Database - Mock Data vs Real Data

### Stat Cards - Mock Data

```typescript
// NYKYINEN (mock)
const statCards = [
  {
    label: 'Yhteensä Tilaukset',
    value: '24',
    trend: '+3 tämän kuukauden aikana',
  },
  {label: 'Toimitettu', value: '22', trend: '91.7% onnistumisaste'},
  {label: 'Odottaa', value: '2', trend: 'Keskimäärin 2.3 päivää'},
  {label: 'Kokonaiskulut', value: '€2,450', trend: '-5% edelliseen kuukauteen'},
];

// TARVITAAN (real data)
// Nämä lasketaan: SELECT COUNT(*), SUM(total_price), AVG(...) FROM ORDERS
```

### Order Cards - Mock Data

```typescript
// NYKYINEN (4 mock tilaus)
const recentOrders: Order[] = [
  { order_id: 1, status: 'done', delivery_address: 'Hämeentie 3...', ... },
  // ... 3 lisää
];

// TARVITAAN
// Todellinen data: SELECT * FROM ORDERS WHERE customer_id = ? ORDER BY ordered_at DESC
```

---

## 6. 🔄 Integrointijärjestys (Prioriteetti)

### 1️⃣ KRIITTINEN (Ensin)

- [ ] Backend: `GET /api/orders` endpoint asiakkaan tilausten haulle
- [ ] Backend: `GET /api/orders/stats` endpoint tilastoille
- [ ] Frontend: `src/services/orderService.ts` API service layer
- [ ] Frontend: `useEffect` hook CustomerDashboardiin real data haulle
- [ ] Frontend: AuthContext tallentaa JWT tokenia

### 2️⃣ TÄRKEÄ (Sitten)

- [ ] Frontend: Error handling (toast notifications)
- [ ] Frontend: Loading skeletons stat cardseille
- [ ] Frontend: Real-time polling (3-5 sec intervals)
- [ ] Backend: `PUT /api/orders/:id` asiakkaan tiedoilla
- [ ] Frontend: "Uusi Tilaus" navigointi

### 3️⃣ BONUS (Myöhemmin)

- [ ] `POST /api/orders/:id/cancel`
- [ ] Settings-välilehden tallentaminen
- [ ] Salasanan vaihto
- [ ] Tilin poisto

---

## 7. 📝 Tekniset Yksityiskohdat

### Token Flow (PUUTTUU)

```
Kirjautuminen → Backend palauttaa JWT token → Frontend tallentaa →
API kutsut käyttävät tokenia → API validoi → Data palautetaan
```

### Mock vs Real Data Vaihto

```typescript
// ENNEN (mock)
useEffect(() => {
  setOrders(recentOrders);
}, []);

// JÄLKEEN (real)
useEffect(() => {
  orderService.getCustomerOrders(token).then((data) => setOrders(data.orders));
}, [token, user]);
```

---

## 8. 🎯 Yhteenveto

| Osa                          | Valmius | Puuttuvat                    |
| ---------------------------- | ------- | ---------------------------- |
| **Frontend UI**              | ✅ 100% | -                            |
| **Backend Schema**           | ✅ 100% | -                            |
| **API Endpointit**           | ❌ 50%  | 2 kriittistä, 2 toissijaista |
| **Frontend API Integration** | ❌ 0%   | Kokonaan puuttuu             |
| **Toiminnallisuus**          | ❌ 20%  | Mock data vain               |
| **Settings Features**        | ❌ 0%   | Kaikki disabloitu            |

### Arvioitu työmäärä

- **Backend API Endpointit:** 1-2 tuntia
- **Frontend Service Layer:** 1 tunti
- **Integraatio & Testing:** 2-3 tuntia
- **Error Handling & UX:** 1-2 tuntia

**Yhteensä:** ~5-8 tuntia täyteen integraatioon

---

## 9. 🚀 Seuraavat Askeleet

1. **Tänään:** Backend endpointit (`GET /api/orders`, `GET /api/orders/stats`)
2. **Huomenna:** Frontend service layer + integraatio
3. **Huomisen jälkeen:** Error handling + Real-time updates
4. **Sprintin lopulla:** Settings features

---

**Muutettu:** 29.04.2026
**Status:** Ready for backend integration
