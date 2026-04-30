# 📦 **QUANTIX LOGISTICS - LOPPUUN SAATTAMISEN OHJEET**

**Status: 60% Valmis → Target: 100%**
**Päivitetty:** 30.04.2026

---

## 🔧 **BACKEND - PUUTTUVAT OMINAISUUDET**

### **1️⃣ ORDER STATUS UPDATE ENDPOINT** _(30min)_

**Tämä on jo osittain valmis!**

**Tarkista:** `backend/controllers/orderController.js` - funktio `updateOrderStatus`

```javascript
// ✅ Tämä on jo olemassa - driver voi päivittää statusta
// Route: PUT /api/orders/:id/status
// Body: { newStatus: "in_transit" | "delivered" | "pending" }
```

**Mitä tehdä:** Lisää endpoint response, joka palauttaa updated order:

```javascript
// Lisää `backend/routes/orderRoutes.js`:iin
// Varmista että route on ENNEN /:id routea!
```

### **2️⃣ PAGINATION & FILTERING** _(20min)_

**Tiedosto:** `backend/services/orderService.js` - funktio `getOrdersByCustomerId`

**Mitä lisätä:**

```javascript
// Nykyinen:
const getOrdersByCustomerId = async (customerId) => { ... }

// Muuta tähän:
const getOrdersByCustomerId = async (customerId, limit = 20, offset = 0, status = null) => {
  let query = `SELECT ... FROM ORDERS WHERE customer_id = ?`;
  let params = [customerId];

  // Status filter
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  query += ` ORDER BY ordered_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [orders] = await pool.query(query, params);
  return orders;
};
```

**Controller update:** `backend/controllers/orderController.js`

```javascript
const getCustomerOrders = async (req, res) => {
  const customerId = req.user.user_id;
  const limit = req.query.limit || 20;
  const offset = req.query.offset || 0;
  const status = req.query.status || null;

  try {
    const orders = await orderService.getOrdersByCustomerId(
      customerId,
      limit,
      offset,
      status
    );
    res.json({success: true, orders});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};
```

### **3️⃣ ORDER NOTIFICATIONS** _(1h)_

**Lisää uusi service:** `backend/services/notificationService.js`

```javascript
const sendOrderNotification = async (userId, message, orderData) => {
  // TODO: Integrointi email/SMS palveluun
  // Esim. Sendgrid, Twilio, jne
  console.log(`Notification for user ${userId}: ${message}`);
};

module.exports = {sendOrderNotification};
```

Käytä aina kun order status muuttuu:

```javascript
// orderController.js updateOrderStatus funktiossa:
await notificationService.sendOrderNotification(
  customerId,
  `Order ${orderId} status: ${newStatus}`,
  {orderId, newStatus}
);
```

### **4️⃣ ADMIN ANALYTICS ENDPOINT** _(45min)_

**Lisää uusi route:** `backend/routes/adminRoutes.js`

```javascript
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
```

**Lisää controller:** `backend/controllers/analyticsController.js`

```javascript
async function getRevenueStats(req, res) {
  try {
    const [stats] = await pool.query(`
      SELECT
        SUM(total_price) as total_revenue,
        COUNT(*) as total_orders,
        AVG(total_price) as avg_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
      FROM ORDERS
      WHERE ordered_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json({success: true, stats: stats[0]});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}
```

---

## 🎨 **FRONTEND - PUUTTUVAT OMINAISUUDET**

### **1️⃣ ORDER DETAILS PAGE** _(30min)_

**Lisää uusi komponentti:** `frontend/src/app/pages/OrderDetailPage.tsx`

```typescript
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { useState, useEffect } from 'react';

export function OrderDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrder(id, token);
        setOrder(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) return <div>Ladataan...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Tilaus #{order?.order_id}</h1>
      <p>Status: {order?.status}</p>
      <p>Osoite: {order?.delivery_address}</p>
      <p>Hinta: €{order?.total_price}</p>
      {/* Näytä tracking map tähän */}
    </div>
  );
}
```

**Lisää orderService funktioon:** `frontend/src/app/services/orderService.ts`

```typescript
getOrder: async (orderId: string, token: string) => {
  const res = await fetch(`/api/orders/${orderId}`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
},
```

**Lisää route:** `frontend/src/app/routes.tsx`

```typescript
{
  path: '/customer/orders/:id',
  element: <OrderDetailPage />,
}
```

### **2️⃣ ORDER TRACKING MAP** _(1-1.5h)_

**Lisää komponentti:** `frontend/src/app/components/OrderTrackingMap.tsx`

```typescript
import { useEffect, useState } from 'react';

export function OrderTrackingMap({ orderId, token }) {
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/tracking`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        setDriverLocation(data.location);
      } catch (err) {
        console.error('Error:', err);
      }
    }, 5000); // Update 5s välein

    return () => clearInterval(interval);
  }, [orderId, token]);

  return (
    <div className="w-full h-96 bg-gray-200 rounded">
      {driverLocation ? (
        <div>
          <p>Kuljettajan sijainti: {driverLocation.latitude}, {driverLocation.longitude}</p>
          {/* Google Maps / Mapbox integration tähän */}
        </div>
      ) : (
        <p>Odotellaan kuljettajaa...</p>
      )}
    </div>
  );
}
```

**Käytä OrderDetailPagessa:**

```typescript
<OrderTrackingMap orderId={order?.order_id} token={token} />
```

### **3️⃣ DRIVER DASHBOARD** _(1.5h)_

**Lisää komponentin:** `frontend/src/app/pages/DriverDashboard.tsx`

```typescript
export function DriverDashboard() {
  const { token } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/assigned', {
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        setAssignedOrders(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="p-6">
      <h1>Sinulle määrätyt tilaukset</h1>
      <div className="grid gap-4">
        {assignedOrders.map(order => (
          <div key={order.order_id} className="border p-4 rounded">
            <h3>Tilaus #{order.order_id}</h3>
            <p>{order.delivery_address}</p>
            <button onClick={() => updateStatus(order.order_id, 'in_transit')}>
              Aloita toimitus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### **4️⃣ ADMIN DASHBOARD** _(2h)_

**Lisää komponentti:** `frontend/src/app/pages/AdminAnalytics.tsx`

```typescript
export function AdminAnalytics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/analytics/revenue', {
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        setStats(data.stats);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="p-6">
      <h1>Admin Analytics</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Kokonaistulot" value={`€${stats?.total_revenue}`} />
        <StatCard label="Tilaukset" value={stats?.total_orders} />
        <StatCard label="Toimitetut" value={stats?.delivered} />
        <StatCard label="Avg tilaus" value={`€${stats?.avg_order_value}`} />
      </div>
    </div>
  );
}
```

---

## ✅ **TARKISTUS LISTA - JÄRJESTYKSESSÄ**

### **BACKEND (1-2 tunti):**

- [ ] Order status update - Response validointi
- [ ] Pagination & filtering - getOrdersByCustomerId update
- [ ] Notifications service - Luoda service
- [ ] Admin analytics - Revenue/order stats endpoints

### **FRONTEND (3-4 tuntia):**

- [ ] Order details page - Uusi route + komponentti
- [ ] Tracking map - Integraatio (Google Maps/Mapbox)
- [ ] Driver dashboard - Assigned orders listing
- [ ] Admin analytics - Revenue dashboard

---

## 🎯 **LOPULLINEN CHECKLIST - DEPLOYMENT**

- [ ] Backend testit menevät läpi: `npm test`
- [ ] Frontend buildaa: `npm run build` (ei erroria)
- [ ] Varmista CORS konfiguraatio
- [ ] API rate limiting implementoitu
- [ ] Error handling & logging
- [ ] Database backups valmis
- [ ] Environment variables dokumentoitu
- [ ] Security headers setupattu

---

**Kun nämä on tehty → **PROJEKTI ON PRODUCTION READY!\*\* 🚀

---

## 📋 KÄYNNISTYS OHJEET

### **BACKEND - KÄYNNISTYS**

```powershell
cd backend
npm install
npm start
```

✅ Odotettu output:

```
Server running on port 3000
Connected to database ✓
```

### **FRONTEND - KÄYNNISTYS**

```powershell
cd frontend
npm run dev
```

✅ Odotettu output:

```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

**Dokumentti päivitetty:** 30.04.2026
**Tekijä:** GitHub Copilot
**Branch:** dev
