# Old API Method Migration Report

**Date Generated:** April 29, 2026  
**Reference File:** `frontend/src/app/lib/api.ts`

---

## Executive Summary

This report identifies **2 files** in the frontend codebase that use the **old method** (direct `fetch()` calls) instead of the centralized **new method** (using the `api` instance from `lib/api.ts`).

**Total Files Affected:** 2  
**Total API Calls to Update:** 2  
**Estimated Total Migration Time:** 20-25 minutes

---

## What Needs to Change?

### Old Method (❌ NOT TO USE)

```typescript
// Direct fetch calls:
const response = await fetch('/api/endpoint', {
  headers: {Authorization: `Bearer ${token}`},
});

// Manual token management:
const token = localStorage.getItem('token');
```

### New Method (✅ CORRECT WAY)

```typescript
// Using centralized api instance:
import api from '../lib/api';

const response = await api.get('/endpoint');
// ✅ Automatically handles:
// - Base URL + /api/v1 prefix
// - Token from localStorage
// - Token refresh if expired
// - Error handling
```

---

## Files Requiring Updates

### 1. ⚠️ `frontend/src/app/utils/updateDeliveryLocation.ts`

**Status:** Needs Migration  
**Severity:** High (used for critical delivery tracking)

#### Current Old Method Usage:

| Line | Code                                                                      |
| ---- | ------------------------------------------------------------------------- |
| 7    | `const token = localStorage.getItem('token');`                            |
| 9    | `const response = await fetch(\`/api/deliveries/${orderId}/tracking\`, {` |
| 13   | `Authorization: \`Bearer ${token}\`,`                                     |

#### Full Current Code:

```typescript
export const updateDeliveryLocation = async (
  orderId: number,
  latitude: number,
  longitude: number
) => {
  try {
    const token = localStorage.getItem('token'); // ❌ Manual token handling

    const response = await fetch(`/api/deliveries/${orderId}/tracking`, {
      // ❌ Direct fetch
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        status: 'in_transit',
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sijainnin päivitys epäonnistui');
    }
    console.log(
      `Sijainti päivitetty tilaukselle ${orderId}: ${latitude}, ${longitude}`
    );
  } catch (error) {
    console.error('Virhe sijainnin lähetyksessä bäkkiin:', error);
  }
};
```

#### Updated Code (Using New Method):

```typescript
import api from '../lib/api';

export const updateDeliveryLocation = async (
  orderId: number,
  latitude: number,
  longitude: number
) => {
  try {
    const response = await api.post(`/deliveries/${orderId}/tracking`, {
      latitude: latitude,
      longitude: longitude,
      status: 'in_transit',
      updated_at: new Date().toISOString(),
    });

    console.log(
      `Sijainti päivitetty tilaukselle ${orderId}: ${latitude}, ${longitude}`
    );
  } catch (error) {
    console.error('Virhe sijainnin lähetyksessä bäkkiin:', error);
  }
};
```

**Changes Required:**

- [ ] Add import: `import api from '../lib/api';`
- [ ] Remove manual token retrieval (`localStorage.getItem`)
- [ ] Replace `fetch()` with `api.post()`
- [ ] Remove manual header setup (api handles it)
- [ ] Keep error handling logic

**Estimated Time:** 5-7 minutes  
**Files Using This:** DeliveryManager.tsx, DriverDeliversPage.tsx, DriverMapPage.tsx (at least)

---

### 2. ⚠️ `frontend/src/app/layouts/DriverRoot.tsx`

**Status:** Needs Migration  
**Severity:** High (root layout component)

#### Current Old Method Usage:

| Line | Code                                                     |
| ---- | -------------------------------------------------------- |
| 22   | `const token = localStorage.getItem('token');`           |
| 23   | `const response = await fetch('/api/orders/assigned', {` |
| 24   | `headers: {Authorization: \`Bearer ${token}\`},`         |

#### Full Current Code:

```typescript
useEffect(() => {
  const fetchMyDeliveries = async () => {
    try {
      const token = localStorage.getItem('token'); // ❌ Manual token handling

      const response = await fetch('/api/orders/assigned', {
        // ❌ Direct fetch
        headers: {Authorization: `Bearer ${token}`},
      });
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Bäkki palautti virheen:', data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Datan haku epäonnistui:', err);
    }
  };

  fetchMyDeliveries();
}, []);
```

#### Updated Code (Using New Method):

```typescript
import api from '../lib/api';

// In the component:
useEffect(() => {
  const fetchMyDeliveries = async () => {
    try {
      const response = await api.get('/orders/assigned');

      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.error('Bäkki palautti virheen:', response.data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Datan haku epäonnistui:', err);
    }
  };

  fetchMyDeliveries();
}, []);
```

**Changes Required:**

- [ ] Add import: `import api from '../lib/api';`
- [ ] Remove manual token retrieval
- [ ] Replace `fetch()` with `api.get()`
- [ ] Update response handling (use `response.data` instead of calling `.json()`)
- [ ] Keep error handling logic

**Estimated Time:** 5-7 minutes  
**Impact:** Affects driver dashboard initialization

---

## Files NOT Requiring Changes ✅

The following files use `fetch()` correctly for **external APIs** (not backend):

| File                  | API Service      | Reason                                      |
| --------------------- | ---------------- | ------------------------------------------- |
| `osrmApi.ts`          | OSRM Routing     | External service (project-osrm.org)         |
| `DeliveryManager.tsx` | OSRM Routing     | External service - don't expose auth tokens |
| `ChatBot.tsx`         | Discord Webhooks | External service                            |
| `ForgotPassword.tsx`  | Discord Webhooks | External service                            |

_Note: Per api.ts comments, external APIs should use `fetch()` directly to avoid exposing authentication tokens._

---

## Migration Checklist

### Phase 1: Update Service Functions

- [ ] **updateDeliveryLocation.ts** (5-7 min)
  - [ ] Add api import
  - [ ] Replace fetch with api.post()
  - [ ] Test with DriverMapPage.tsx

### Phase 2: Update Layout Components

- [ ] **DriverRoot.tsx** (5-7 min)
  - [ ] Add api import
  - [ ] Replace fetch with api.get()
  - [ ] Test navigation and order loading

### Phase 3: Testing

- [ ] [ ] Verify driver can see assigned orders on login
  - [ ] Verify delivery location updates work
  - [ ] Check that token refresh still works properly
  - [ ] Test error handling (401, network errors)

---

## Time Breakdown

| Task                             | Time              |
| -------------------------------- | ----------------- |
| updateDeliveryLocation.ts update | 5-7 min           |
| DriverRoot.tsx update            | 5-7 min           |
| Testing all changes              | 5-10 min          |
| **TOTAL**                        | **20-25 minutes** |

---

## References

- **API Configuration:** `frontend/src/app/lib/api.ts`
- **Migration Guide Comments:** Lines 4-19 in api.ts
- **Benefits of Using Centralized API:**
  - ✅ Automatic token management
  - ✅ Automatic token refresh on 401
  - ✅ Consistent base URL
  - ✅ Centralized error handling
  - ✅ Type-safe axios instance

---

## Notes

- Token key inconsistency: Some files use `'token'` while api.ts uses `'accessToken'`. This should be standardized.
- External API calls correctly use `fetch()` to avoid token leakage ✅
- No direct axios imports found in component files (good practice) ✅
