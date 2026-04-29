# 🛠️ CustomerDashboard - Technical Specification

## Mock Data vs Real Data Mapping

### Stat Cards (StatCards)

#### MOCK (Nykyinen)

```typescript
const statCards = [
  {label: 'Yhteensä Tilaukset', value: '24'},
  {label: 'Toimitettu', value: '22'},
  {label: 'Odottaa', value: '2'},
  {label: 'Kokonaiskulut', value: '€2,450'},
];
```

#### REAL (Tarvitaan)

```sql
-- Backend SQL queries
SELECT COUNT(*) as total_orders FROM ORDERS WHERE customer_id = ?;
SELECT COUNT(*) as delivered FROM ORDERS WHERE customer_id = ? AND status = 'done';
SELECT COUNT(*) as pending FROM ORDERS WHERE customer_id = ? AND status IN ('pending', 'assigned');
SELECT SUM(total_price) as total_spent FROM ORDERS WHERE customer_id = ?;
SELECT AVG(total_price) as average FROM ORDERS WHERE customer_id = ?;
SELECT AVG(DATEDIFF(DAY, ordered_at, scheduled_delivery)) as avg_delivery_days
  FROM ORDERS WHERE customer_id = ? AND status = 'done';
SELECT ROUND(COUNT(CASE WHEN status = 'done' THEN 1 END) * 100.0 / COUNT(*), 1) as success_rate
  FROM ORDERS WHERE customer_id = ?;
```

---

### Order Cards (OrderCard)

#### MOCK (4 hardcoded orders)

```typescript
const recentOrders: Order[] = [
  { order_id: 1, status: 'done', delivery_address: 'Hämeentie 3, 00530 Helsinki', ... },
  { order_id: 2, status: 'in_transit', delivery_address: 'Leppävaarankatu 2, 02600 Espoo', ... },
  { order_id: 3, status: 'assigned', delivery_address: 'Kauppakeskus Ainoa, 01600 Vantaa', ... },
  { order_id: 4, status: 'pending', delivery_address: 'Aleksanterinkatu 12, 33100 Tampere', ... }
];
```

#### REAL

```sql
SELECT
  o.order_id,
  o.status,
  o.delivery_address,
  o.total_price,
  o.ordered_at,
  COUNT(oi.order_item_id) as item_count,
  u.email as driver_email
FROM ORDERS o
LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
LEFT JOIN USERS u ON o.driver_id = u.user_id
WHERE o.customer_id = ?
GROUP BY o.order_id
ORDER BY o.ordered_at DESC
LIMIT 20;
```

---

### Tilin Yhteenveto (Account Summary)

#### MOCK

```typescript
<p>{user?.email}</p>  // ← AuthContext mockista
<p>Ei asetettu</p>    // ← Hardcoded
<p>{new Date().toLocaleDateString('fi-FI')}</p>  // ← Tänään
```

#### REAL (Tarvitaan)

```sql
SELECT
  u.email,
  cp.tel as phone,
  u.created_at,
  (SELECT MAX(updated_at) FROM DELIVERY_TRACKING
   WHERE order_id IN (SELECT order_id FROM ORDERS WHERE customer_id = ?))
   as last_login
FROM USERS u
LEFT JOIN CUSTOMER_PROFILES cp ON u.user_id = cp.user_id
WHERE u.user_id = ?;
```

---

## API Endpoints Specification

### 1. GET /api/orders (NEW - KRIITTINEN)

```http
GET /api/orders
Authorization: Bearer {JWT_TOKEN}
```

**Response 200:**

```json
{
  "success": true,
  "orders": [
    {
      "order_id": 1,
      "status": "done",
      "delivery_address": "Hämeentie 3, 00530 Helsinki",
      "total_price": 450.25,
      "ordered_at": "2026-04-28T09:30:00Z",
      "item_count": 3,
      "driver_email": "driver1@quantix.fi"
    },
    ...
  ]
}
```

**Backend Implementation:**

```javascript
// orderController.js
async function getCustomerOrders(req, res) {
  try {
    const customerId = req.user.user_id;
    const orders = await orderService.getOrdersByCustomerId(customerId);
    res.json({success: true, orders});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
}

// orderRoutes.js
router.get('/', authMiddleware.authenticate, orderController.getCustomerOrders);
```

**Service Implementation:**

```javascript
// orderService.js
async function getOrdersByCustomerId(customerId) {
  const [orders] = await pool.query(
    `
    SELECT
      o.order_id,
      o.status,
      o.delivery_address,
      o.total_price,
      o.ordered_at,
      COUNT(oi.order_item_id) as item_count,
      u.email as driver_email
    FROM ORDERS o
    LEFT JOIN ORDER_ITEMS oi ON o.order_id = oi.order_id
    LEFT JOIN USERS u ON o.driver_id = u.user_id
    WHERE o.customer_id = ?
    GROUP BY o.order_id
    ORDER BY o.ordered_at DESC
    LIMIT 50
  `,
    [customerId]
  );

  return orders;
}
```

---

### 2. GET /api/orders/stats (NEW - KRIITTINEN)

```http
GET /api/orders/stats
Authorization: Bearer {JWT_TOKEN}
```

**Response 200:**

```json
{
  "total_orders": 24,
  "delivered_count": 22,
  "pending_count": 2,
  "in_transit_count": 0,
  "total_spent": 2450.0,
  "average_order_value": 451.25,
  "delivery_speed_days": 8.4,
  "success_rate": 91.7
}
```

**Backend Implementation:**

```javascript
// orderController.js
async function getOrderStats(req, res) {
  try {
    const customerId = req.user.user_id;
    const stats = await orderService.getOrderStats(customerId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
}

// orderRoutes.js
router.get(
  '/stats',
  authMiddleware.authenticate,
  orderController.getOrderStats
);
```

**Service Implementation:**

```javascript
// orderService.js
async function getOrderStats(customerId) {
  const [stats] = await pool.query(
    `
    SELECT
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as delivered_count,
      SUM(CASE WHEN status IN ('pending', 'assigned') THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status IN ('in_progress', 'in_transit') THEN 1 ELSE 0 END) as in_transit_count,
      COALESCE(SUM(total_price), 0) as total_spent,
      COALESCE(AVG(total_price), 0) as average_order_value,
      COALESCE(ROUND(AVG(DATEDIFF(CURDATE(), ordered_at)), 1), 0) as delivery_speed_days,
      COALESCE(ROUND(
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) * 100.0 /
        NULLIF(COUNT(*), 0), 1), 0) as success_rate
    FROM ORDERS
    WHERE customer_id = ?
  `,
    [customerId]
  );

  return (
    stats[0] || {
      total_orders: 0,
      delivered_count: 0,
      pending_count: 0,
      in_transit_count: 0,
      total_spent: 0,
      average_order_value: 0,
      delivery_speed_days: 0,
      success_rate: 0,
    }
  );
}
```

---

## Frontend Integration

### 1. AuthContext Token Storage (MUUTOS)

**Nykyinen:**

```typescript
// ❌ Token ei tallenneta
const [user, setUser] = useState<User | null>(() => {
  const saved = localStorage.getItem('quantix_user');
  return saved ? JSON.parse(saved) : null;
});
```

**Tarvitaan:**

```typescript
// ✅ Token tallennetaan
const [user, setUser] = useState<User | null>(...);
const [token, setToken] = useState<string | null>(() => {
  return localStorage.getItem('quantix_token') || null;
});

const login = (email: string, password: string): boolean => {
  // ... backend login kutsun jälkeen
  const jwtToken = response.token;  // Backendin palauttama JWT
  localStorage.setItem('quantix_token', jwtToken);
  setToken(jwtToken);
  // ...
};
```

### 2. Order Service (UUS)

**Tiedosto:** `frontend/src/app/services/orderService.ts`

```typescript
const API_BASE = 'http://localhost:3000/api';

interface Order {
  order_id: number;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'in_transit'
    | 'done'
    | 'stuck';
  delivery_address: string;
  total_price: number;
  ordered_at: string;
  item_count: number;
  driver_email?: string;
}

interface OrderStats {
  total_orders: number;
  delivered_count: number;
  pending_count: number;
  in_transit_count: number;
  total_spent: number;
  average_order_value: number;
  delivery_speed_days: number;
  success_rate: number;
}

export const orderService = {
  async getCustomerOrders(token: string): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.orders;
  },

  async getOrderStats(token: string): Promise<OrderStats> {
    const res = await fetch(`${API_BASE}/orders/stats`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
```

### 3. CustomerDashboard Integration (MUUTOS)

**Muutettavat kohdat:**

```typescript
import { orderService } from '../services/orderService';

export function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('quantix_token');
        if (!token) throw new Error('No authentication token');

        const [ordersData, statsData] = await Promise.all([
          orderService.getCustomerOrders(token),
          orderService.getOrderStats(token)
        ]);

        setOrders(ordersData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('CustomerDashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Päivitä stat cards data
  if (stats) {
    statCards[0].value = stats.total_orders.toString();
    statCards[1].value = stats.delivered_count.toString();
    statCards[2].value = stats.pending_count.toString();
    statCards[3].value = `€${stats.total_spent.toFixed(2)}`;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Virhe: {error}</div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return <LoadingSkeletons />;
  }

  // ... rest of component using orders and stats
}
```

---

## Error Handling & Edge Cases

### Backend

```javascript
// Validaatiot
if (!customerId) {
  return res.status(400).json({ error: 'Customer ID required' });
}

// Database errors
try {
  const orders = await pool.query(...);
} catch (err) {
  console.error('Database error:', err);
  return res.status(500).json({ error: 'Failed to fetch orders' });
}

// Empty results
if (!orders || orders.length === 0) {
  return res.json({ success: true, orders: [] });
}
```

### Frontend

```typescript
try {
  const data = await orderService.getCustomerOrders(token);
  setOrders(data);
} catch (err) {
  if (err instanceof Error) {
    if (err.message.includes('401')) {
      // Re-authenticate
      logout();
      navigate('/login');
    } else if (err.message.includes('404')) {
      setOrders([]);
    } else {
      showNotification(err.message, 'error');
    }
  }
  setError(err.message);
}
```

---

## Testing Checklist

- [ ] Backend: `GET /api/orders` returns customer's orders
- [ ] Backend: `GET /api/orders/stats` returns correct statistics
- [ ] Frontend: Orders load on page load
- [ ] Frontend: Stats cards populate with real data
- [ ] Frontend: Polling updates data every 5 seconds
- [ ] Frontend: Error notification on network error
- [ ] Frontend: Loading state shows while fetching
- [ ] Frontend: Filter buttons work with real data
- [ ] Frontend: OrderCard displays correct status colors
- [ ] Frontend: Empty state when no orders

---

## Performance Considerations

1. **Database Indexes:**

   ```sql
   CREATE INDEX idx_orders_customer_date ON ORDERS(customer_id, ordered_at DESC);
   CREATE INDEX idx_orders_customer_status ON ORDERS(customer_id, status);
   ```

2. **Frontend Polling:**
   - Use `setInterval` for 5-second polling
   - Implement exponential backoff on errors
   - Clear interval on component unmount

3. **Response Caching:**
   - Cache orders for 1 minute client-side
   - Invalidate on refresh button click
   - Use `stale-while-revalidate` pattern

---

**Status:** Ready for implementation
**Priority:** CRITICAL
**Estimated Time:** 5-8 hours
