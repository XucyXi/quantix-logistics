# CustomerDashboard - Dokumentaatio

Kattava analyysi asiakaspaneelis puuttuvista arvoista ja integraatiotarpeista.

## 📚 Dokumentit

### 1. **[CUSTOMER_DASHBOARD_REPORT.md](./CUSTOMER_DASHBOARD_REPORT.md)**

📊 **Kattava Status Raportti** - Täydellinen analyysi

- ✅ Mikä on valmista
- ❌ Mitkä puuttuu
- 🗄️ Database mapping
- 🔄 Integrointijärjestys
- **Luku-aika:** 10-15 min

### 2. **[CUSTOMER_DASHBOARD_QUICK_GUIDE.md](./CUSTOMER_DASHBOARD_QUICK_GUIDE.md)**

🎯 **Nopea Opas** - TL;DR version

- 📊 Status bar
- 🔴 Kriittiset asiat
- 📋 TODO lista
- 🔧 Koodin esimerkit
- **Luku-aika:** 5 min

### 3. **[CUSTOMER_DASHBOARD_TECHNICAL_SPEC.md](./CUSTOMER_DASHBOARD_TECHNICAL_SPEC.md)**

🛠️ **Tekninen Spesifikaatio** - Kehittäjille

- 📝 API endpoint spesifikaatiot
- 💾 SQL kyselyt
- 🔗 Frontend integraatio
- 🧪 Testing checklist
- **Luku-aika:** 15-20 min

---

## 🚀 Quick Start

### Nopeasti ymmärtämään:

1. Lue [CUSTOMER_DASHBOARD_QUICK_GUIDE.md](./CUSTOMER_DASHBOARD_QUICK_GUIDE.md) (5 min)
2. Katso "KRIITTISET PUUTTUVAT ASIAT" kohta
3. Aloita Phase 1 backend API:sta

### Tarkemmaksi:

1. Lue [CUSTOMER_DASHBOARD_REPORT.md](./CUSTOMER_DASHBOARD_REPORT.md) (15 min)
2. Tutustu SQL kyselyihin
3. Ymmärrä frontend-backend flow

### Implementoimaan:

1. Tutustu [CUSTOMER_DASHBOARD_TECHNICAL_SPEC.md](./CUSTOMER_DASHBOARD_TECHNICAL_SPEC.md)
2. Kopioi koodin esimerkit
3. Seuraa testing checklistiä

---

## 📊 Status Summary

| Komponentti              | Status    | Arvioidtu työ |
| ------------------------ | --------- | ------------- |
| Frontend UI              | ✅ 100%   | 0h            |
| Backend Schema           | ✅ 100%   | 0h            |
| Backend API              | ❌ 50%    | 1-2h          |
| Frontend API Integration | ❌ 0%     | 1h            |
| Error Handling           | ❌ 0%     | 1-2h          |
| Real-time Updates        | ❌ 0%     | 1h            |
| Settings Features        | ❌ 0%     | 2h            |
| **YHTEENSÄ**             | **≈ 20%** | **~5-8h**     |

---

## 🎯 Prioriteetti

### 🔴 KRIITTINEN (Tee nyt)

1. Backend: `GET /api/orders` endpoint
2. Backend: `GET /api/orders/stats` endpoint
3. Frontend: API service layer
4. Frontend: useEffect integration

### 🟡 TÄRKEÄ (Tee seuraavaksi)

5. Frontend: Error handling
6. Frontend: Loading states
7. Backend: JWT token handling
8. Frontend: Real-time polling

### 🟢 BONUS (Myöhemmin)

9. Settings-välilehden features
10. Tilauksen yksityiskohdat
11. Uusi tilaus toiminnallisuus

---

## 💻 Koodin Sijainnit

```
backend/
├── controllers/orderController.js    ← Lisää getCustomerOrders()
├── services/orderService.js          ← Lisää getOrdersByCustomerId()
└── routes/orderRoutes.js             ← Lisää GET / endpoint

frontend/src/app/
├── services/                         ← UUSI
│   └── orderService.ts              ← API fetch wrapper
├── contexts/AuthContext.tsx          ← Muokkaa token tallennus
├── pages/CustomerDashboard.tsx       ← Muokkaa useEffect
└── components/
    └── MasterTable.tsx              ← (Käyttää jo orderController)
```

---

## 🔄 Data Flow

```
Käyttäjä kirjautuu
    ↓
Backend validoi → Palauttaa JWT token
    ↓
Frontend tallentaa token localStorage:iin
    ↓
CustomerDashboard useEffect käy päälle
    ↓
Frontend haku: GET /api/orders + GET /api/orders/stats
    ↓
Backend kyselee USERS + ORDERS + ORDER_ITEMS + DELIVERY_TRACKING tauluja
    ↓
Backend laskee stats ja palauttaa JSON
    ↓
Frontend päivittää state + näyttää UI:ssa
    ↓
Polling joka 5 sekunnin välein
```

---

## 📝 Mock vs Real Data

### Nykyinen (Mock)

```typescript
const recentOrders = [
  { order_id: 1, status: 'done', ... },
  { order_id: 2, status: 'in_transit', ... },
  // ... 2 lisää
];

const statCards = [
  { value: '24' },    // ← Hardcoded
  { value: '22' },
  { value: '2' },
  { value: '€2,450' }
];
```

### Tarvitaan (Real)

```typescript
// Backend hakee:
SELECT * FROM ORDERS WHERE customer_id = ? ORDER BY ordered_at DESC;
SELECT COUNT(*), SUM(total_price), AVG(...) FROM ORDERS WHERE customer_id = ?;

// Frontend näyttää:
orders.map(order => <OrderCard order={order} />);
statCards[0].value = stats.total_orders;
statCards[1].value = stats.delivered_count;
// ... jne
```

---

## ✅ Validation

Kun implementation on valmis, testaa:

- [ ] Kirjautuminen tallentaa JWT tokenia
- [ ] `GET /api/orders` palauttaa asiakkaan tilaukset
- [ ] `GET /api/orders/stats` palauttaa oikeat numerot
- [ ] Order cards näyttävät oikeat status värit
- [ ] Filtterit toimivat real datan kanssa
- [ ] "Uusi Tilaus" nappi navigoi oikein
- [ ] Polling päivittää dataa joka 5 sekunnissa
- [ ] Error toast näkyy verkon katkolla
- [ ] Loading skeleton näkyy hakiessa dataa
- [ ] Empty state näkyy kun ei ole tilauksia

---

## 🤔 FAQ

**Q: Miksi mock data käytetään nyt?**
A: Frontend UI testaus ja dev edetessä ilman backendia. MVP valmis nopeasti.

**Q: Koska real data integraatio?**
A: Seuraava sprintti. Ensin backend endpointit, sitten frontend integraatio.

**Q: Miksi polling joka 5 sekuntia?**
A: Balance latency vs. palvelin kuormitus. WebSocket voisi olla myöhemmin.

**Q: Voidaanko salasana muuttaa?**
A: On roadmapin bonus features kohdassa. Ei kriittinen MVP:lle.

**Q: Entä tilin poisto?**
A: Backend endpoint pitää ensin implementoida. Frontend UI valmis.

---

## 📞 Kontakti & Support

Kysymyksiä? Katso dokumentista enemmän tai ota yhteyttä!

- **Raportti:** [CUSTOMER_DASHBOARD_REPORT.md](./CUSTOMER_DASHBOARD_REPORT.md)
- **Tekniikka:** [CUSTOMER_DASHBOARD_TECHNICAL_SPEC.md](./CUSTOMER_DASHBOARD_TECHNICAL_SPEC.md)
- **Nopea opas:** [CUSTOMER_DASHBOARD_QUICK_GUIDE.md](./CUSTOMER_DASHBOARD_QUICK_GUIDE.md)

---

**Luotu:** 29.04.2026
**Versio:** 1.0
**Status:** Ready for implementation
