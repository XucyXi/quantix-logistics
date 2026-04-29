# 🎯 CustomerDashboard - Nopea Status & TODO

## 📊 Current Status

```
Frontend UI:        ████████████████████ 100% ✅
Backend Schema:     ████████████████████ 100% ✅
Backend API:        ██████░░░░░░░░░░░░░░  50% ⚠️
Frontend Integration:░░░░░░░░░░░░░░░░░░░░   0% ❌
Settings Features:  ░░░░░░░░░░░░░░░░░░░░   0% ❌
```

---

## 🔴 KRIITTISET PUUTTUVAT ASIAT

### Backend

```
❌ GET /api/orders              - Asiakkaan tilausten haku (KRIITTINEN)
❌ GET /api/orders/stats        - Tilastojen laskenta (KRIITTINEN)
⚠️ Auth token tallentaminen     - JWT token ei tallennu frontendilla
```

### Frontend

```
❌ src/services/orderService.ts - API service layer (PUUTTUU KOKONAAN)
❌ useEffect hook               - Real data haku (EI KÄYTÖSSÄ)
❌ Error handling               - Toast notifications (PUUTTUU)
❌ Loading states               - Skeletons (PUUTTUU)
```

---

## 📋 TODO Lista

### Phase 1: Backend API (1-2 tuntia)

- [ ] `GET /api/orders` endpoint
  - Hakee: `SELECT * FROM ORDERS WHERE customer_id = ?`
  - Palauttaa: order_id, status, delivery_address, total_price, ordered_at, item_count

- [ ] `GET /api/orders/stats` endpoint
  - Hakee: COUNT, SUM(total_price), AVG, success rate
  - Palauttaa: total_orders, delivered_count, pending_count, total_spent

### Phase 2: Frontend Integration (1 tunti)

- [ ] Luo `src/app/services/orderService.ts`
  - Fetch wrapper funktiot
  - Headers + Authorization
  - Error handling

- [ ] Päivitä `AuthContext.tsx`
  - Tallenna JWT token localStorage:iin
  - Käytä tokenia API kutsuissa

- [ ] Päivitä `CustomerDashboard.tsx`
  - Poista mock data (recentOrders)
  - Lisää useEffect() hook
  - Hae data backendista
  - Laske stat cards data

### Phase 3: UX Improvements (2-3 tuntia)

- [ ] Error handling (toast notifications)
- [ ] Loading states (skeletons)
- [ ] Real-time polling (3-5 sec intervals)
- [ ] Empty states

### Phase 4: Settings Features (Optional)

- [ ] "Uusi Tilaus" toiminnallisuus
- [ ] "Näytä" tilauksen yksityiskohdat
- [ ] Puhelinnumero tallentaminen
- [ ] Ilmoitus asetukset
- [ ] Salasanan vaihto
- [ ] Tilin poisto

---

## 🔧 Koodin Esimerkki

### Backend Controller - TARVITAAN

```javascript
// backend/controllers/orderController.js

async function getCustomerOrders(req, res) {
  try {
    const customerId = req.user.user_id;
    const orders = await orderService.getOrdersByCustomerId(customerId);
    res.json({success: true, orders});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
}

async function getOrderStats(req, res) {
  try {
    const customerId = req.user.user_id;
    const stats = await orderService.getOrderStats(customerId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
}
```

### Frontend Service - TARVITAAN

```typescript
// frontend/src/app/services/orderService.ts

const API_BASE = 'http://localhost:3000/api';

export const orderService = {
  getCustomerOrders: async (token: string) => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return res.json();
  },

  getOrderStats: async (token: string) => {
    const res = await fetch(`${API_BASE}/orders/stats`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return res.json();
  },
};
```

### Frontend Component - MUUTETAAN

```typescript
// frontend/src/app/pages/CustomerDashboard.tsx

export function CustomerDashboard() {
  const {user} = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('quantix_token');
        const [ordersData, statsData] = await Promise.all([
          orderService.getCustomerOrders(token),
          orderService.getOrderStats(token),
        ]);

        setOrders(ordersData.orders);
        setStats(statsData);
      } catch (err) {
        console.error('Virhe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // ... rest of component
}
```

---

## 📞 Yhteenveto

**Mitä valmista:**

- ✅ UI/UX 100%
- ✅ Database schema
- ✅ Osittaiset API routes

**Mitä puuttuu:**

- ❌ 2 kriittistä API endpointia
- ❌ Frontend-backend integraatio
- ❌ Settings funktiot

**Arvioitu lisätyö:** 5-8 tuntia

---

**Valmis seuraaviin vaiheisiin!** 🚀
