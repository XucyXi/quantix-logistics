# Backend API & SQL Handoff - Quantix Logistics

Tämä dokumentti määrittelee frontendin tarvitsemat REST API -endpointit ja esimerkit SQL-kyselyistä, joilla data saadaan kasaan. Frontend odottaa datan tulevan JSON-muodossa näiden rakenteiden mukaisesti.

---

## 1. Tuotteet (ProductsPage)

Frontend tarvitsee tuotteet ja niihin liittyvät kategoriat. Frontend odottaa, että `categories` on taulukko (Array) merkkijonoja.

### Endpointit

- `GET /api/products` - Hakee kaikki tuotteet
- `POST /api/products` - Luo uuden tuotteen
- `PUT /api/products/:id` - Päivittää tuotteen
- `DELETE /api/products/:id` - Poistaa tuotteen

### SQL Esimerkki: GET /api/products

Koska kategoriat ovat todennäköisesti omassa liitostaulussaan (`PRODUCT_CATEGORIES`), backendin pitää yhdistää ne.

```sql
SELECT
    p.id,
    p.name,
    p.description,
    p.base_price AS price,
    p.stock_quantity AS stock,
    GROUP_CONCAT(c.name) AS categories_string
FROM PRODUCTS p
LEFT JOIN PRODUCT_CATEGORIES pc ON p.id = pc.product_id
LEFT JOIN CATEGORIES c ON pc.category_id = c.id
GROUP BY p.id;
```

_Huom: Backendin tulee jakaa (split) `categories_string` JSON-taulukoksi, esim. `["Hedelmät", "Luomu"]`._

---

## 2. Tilaukset & Kuskin määräys (OrdersPage)

Frontend listaa tilaukset, niiden kokonaisarvon, tuotteiden määrän ja mahdollistaa kuljettajan määräämisen.

### Endpointit

- `GET /api/orders` - Hakee tilaukset (mahdollisesti sivutettuna)
- `PATCH /api/orders/:id/driver` - Päivittää tilauksen kuskin ja muuttaa statuksen

### SQL Esimerkki: GET /api/orders

```sql
SELECT
    o.id,
    o.customer_name,
    o.store_name AS store,
    o.total_price AS total,
    o.status,
    o.ordered_at AS orderedAt,
    o.delivery_address AS deliveryAddress,
    o.notes,
    o.driver_id AS driverId,
    COUNT(oi.item_id) AS items
FROM ORDERS o
LEFT JOIN ORDER_ITEMS oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.ordered_at DESC;
```

### SQL Esimerkki: PATCH /api/orders/:id/driver

Frontend lähettää: `{ "driver_id": 2 }`

```sql
UPDATE ORDERS
SET
    driver_id = ?,
    status = 'assigned'
WHERE id = ?;
```

---

## 3. Reitit & Dashboard (RoutesPage & AdminDashboard)

Reitti on dynaaminen kooste kuskin päivän tilauksista. Frontend tarvitsee tiedon kuskista ja siitä, kuinka monta tilausta hänellä on ja moniko on toimitettu.

### Endpointit

- `GET /api/routes/daily-overview` - Hakee kuluvan päivän aktiiviset kuskit ja heidän tilausmääränsä.
- `POST /api/routes/:driverId/acknowledge` - (Dashboard) Kuittaa kuskin reitin nähdyksi.

### SQL Esimerkki: GET /api/routes/daily-overview

Tämä kysely ryhmittelee tämän päivän tilaukset kuljettajan mukaan.

```sql
SELECT
    d.id AS driverId,
    d.full_name AS driverName,
    d.vehicle_info AS vehicleInfo,
    MAX(o.delivery_area) AS area,
    COUNT(o.id) AS totalStops,
    SUM(CASE WHEN o.status = 'done' THEN 1 ELSE 0 END) AS completedStops,
    MAX(
        CASE
            WHEN o.status = 'stuck' THEN 'stuck'
            WHEN o.status = 'in_progress' THEN 'in_progress'
            ELSE 'pending'
        END
    ) AS status
FROM DRIVER_PROFILES d
JOIN ORDERS o ON d.id = o.driver_id
WHERE DATE(o.ordered_at) = CURDATE()
GROUP BY d.id;
```

---

## 4. Raportit & Analytiikka (ReportsPage)

Graafeja ja KPI-mittareita varten. Kaikki laskenta tapahtuu tietokannassa, ja frontend esittää backendin palauttamat luvut.

### Endpointit

- `GET /api/reports/kpi` - Ylätason numerot (Liikevaihto, keskitoimitusaika jne.)
- `GET /api/reports/monthly-revenue` - Data kuukausigraafille
- `GET /api/reports/category-sales` - Data palkkigraafille

### SQL Esimerkki: GET /api/reports/kpi

Laskee mm. keskitoimitusajan tilaushetken ja kuittaushetken erotuksena.

```sql
SELECT
    SUM(total_price) AS revenue,
    COUNT(id) AS deliveredOrders,
    AVG(total_price) AS avgOrderValue,
    AVG(TIMESTAMPDIFF(MINUTE, ordered_at, order_finished)) AS avgDeliveryTimeMinutes
FROM ORDERS
WHERE status = 'done'
AND MONTH(ordered_at) = MONTH(CURDATE());
```

### SQL Esimerkki: GET /api/reports/monthly-revenue

```sql
SELECT
    MONTHNAME(ordered_at) AS month,
    SUM(total_price) AS revenue,
    COUNT(id) AS orders
FROM ORDERS
WHERE YEAR(ordered_at) = YEAR(CURDATE())
GROUP BY MONTH(ordered_at)
ORDER BY MONTH(ordered_at);
```

---

## 5. Asetukset & Turvallisuus (SettingsPage)

Järjestelmän asetusten ja salasanojen hallinta.

### Endpointit

- `PUT /api/settings/company` - Päivittää yrityksen tiedot
- `PUT /api/auth/change-password` - Vaihtaa salasanan

### Backend logiikka: PUT /api/auth/change-password

Backendin työvaiheet:

1. Hae kirjautuneen käyttäjän nykyinen `password_hash` tietokannasta.
2. Vertaile (esim. bcrypt), täsmääkö frontendin lähettämä `currentPassword` hashin kanssa.
3. Jos täsmää, luo uusi hash frontendin lähettämästä `newPassword` arvosta.
4. Tallenna uusi hash tietokantaan:

```sql
UPDATE USERS
SET password_hash = ?
WHERE id = ?;
```

---

## Kehittäjän muistilista

- **Datatyypit:** Frontend käyttää Reactia (TypeScript) ja olettaa REST API:n palauttavan oikeita datatyyppejä (numerot numeroina, ei stringeinä "15.00").
- **Nimeämiskäytännöt:** CamelCase JSON-vastauksissa on suositeltavaa, mutta tarvittaessa frontend voi myös mapata snake_case -muodon.
