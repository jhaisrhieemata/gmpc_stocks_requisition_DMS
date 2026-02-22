# Stock Requisition Hub - API Implementation Guide

## ✅ Implementation Complete

The full-stack application is now set up with a working backend API and connected frontend.

---

## 🏗️ Architecture Overview

### Backend (Express.js + MySQL)
- **Server:** Running on `http://localhost:3000`
- **Database:** MySQL (XAMPP)
- **API Base URL:** `http://localhost:3000/api`

### Frontend (React + Vite + TypeScript)
- **UI Server:** Running on `http://localhost:8080`
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui

---

## 📚 API Endpoints Implemented

### Authentication (`/api/auth`)
```
POST   /auth/login           - User login
POST   /auth/register        - User registration  
POST   /auth/logout          - User logout
GET    /auth/me              - Get current user
```

### Users (`/api/users`)
```
GET    /users                - Get all users
GET    /users/:id            - Get user by ID
PUT    /users/:id            - Update user
DELETE /users/:id            - Delete user
```

### Branches (`/api/branches`)
```
GET    /branches             - Get all branches
GET    /branches/:id         - Get branch by ID
POST   /branches             - Create branch
PUT    /branches/:id         - Update branch
DELETE /branches/:id         - Delete branch (soft delete)
```

### Suppliers (`/api/suppliers`)
```
GET    /suppliers            - Get all suppliers
GET    /suppliers/:id        - Get supplier by ID
POST   /suppliers            - Create supplier
PUT    /suppliers/:id        - Update supplier
DELETE /suppliers/:id        - Delete supplier (soft delete)
```

### Inventory (`/api/inventory`)
```
GET    /inventory            - Get all inventory items
GET    /inventory/:id        - Get item by ID
POST   /inventory            - Create item
PUT    /inventory/:id        - Update item
DELETE /inventory/:id        - Delete item (soft delete)
```

### Requisitions (`/api/requisitions`)
```
GET    /requisitions         - Get all requisitions
GET    /requisitions/:id     - Get requisition with items
POST   /requisitions         - Create requisition
PUT    /requisitions/:id     - Update requisition status
DELETE /requisitions/:id     - Delete requisition
```

---

## 🔐 Authentication

All API endpoints (except `/auth/login` and `/auth/register`) require authentication via JWT token.

### How to Authenticate Frontend Requests

1. **Login:** Call `/api/auth/login` with email and password
2. **Token Storage:** Token is automatically stored in localStorage
3. **Subsequent Requests:** Token is included in `Authorization` header:
   ```
   Authorization: Bearer <token>
   ```

### Frontend Authentication Flow

The frontend uses the `AuthContext` for authentication:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  // Login
  const result = await login('user@example.com', 'password');
  
  // Check user
  if (user) {
    console.log('Logged in as:', user.name);
  }
  
  // Logout
  logout();
}
```

---

## 🖥️ Database Schema

### Tables Created

1. **branches** - Store branch information
   - id (PK), name, address, contact_number, email, classification, is_active

2. **suppliers** - Store supplier information
   - id (PK), name, contact_person, phone, email, classification, is_active

3. **users** - Store user accounts
   - id (PK), email, password (hashed), full_name, role, branch_id (FK), is_active, last_login

4. **inventory** - Store inventory items
   - id (PK), description, unit_price, measurement_unit, status, supplier_id (FK), branch_id (FK), quantity_on_hand, reorder_level, is_active

5. **requisitions** - Store requisition requests
   - id (PK), request_number, user_id (FK), branch_id (FK), type, status, total_amount, signature_data, timestamps

6. **requisition_items** - Store items in requisitions
   - id (PK), requisition_id (FK), inventory_id (FK), quantity, unit_price, total_price, status, timestamps

---

## 🔄 API Usage Examples

### User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "admin"
  }
}
```

### Create Branch

```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Main Office",
    "address": "123 Main St",
    "contact_number": "09171234567",
    "email": "main@example.com",
    "classification": "Head Office"
  }'
```

### Create Requisition

```bash
curl -X POST http://localhost:3000/api/requisitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_id": 1,
    "branch_id": 1,
    "type": "office_supplies",
    "items": [
      {
        "inventory_id": 1,
        "quantity": 5,
        "unit_price": 100,
        "total_price": 500,
        "description": "Ballpen"
      }
    ]
  }'
```

---

## 🚀 Running the Application

### Start Backend
```bash
cd server
npm install
npm run migrate    # Run database migrations
node start.js      # Or npm run dev for development
```

### Start Frontend
```bash
npm install
npm run dev
```

Both servers should be running:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8080`

---

## 💾 Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (`.env`)
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gmpc_requisition
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here
PORT=3000
NODE_ENV=development
```

---

## 📝 Frontend Service Functions

The API service (`src/services/api.ts`) provides helper functions:

```typescript
// Authentication
await api.login(email, password);
await api.signup(email, password, name, role);

// Branches
await api.getBranches();
await api.createBranch(data);

// Suppliers
await api.getSuppliers();
await api.createSupplier(data);

// Inventory
await api.getInventoryFromAPI();
await api.createInventoryItem(data);

// Requisitions
await api.getRequisitions();
await api.getRequisition(id);
await api.updateRequisitionStatus(id, status);
await api.submitRequisition(data);
```

---

## 🧪 Testing Endpoints

Use the provided test endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# List branches (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/branches
```

---

## 🔧 Common Tasks

### Add New API Route

1. Create route file in `server/src/routes/`
2. Define handler functions using the `query` helper
3. Import and mount in `server/src/app.js`:
   ```javascript
   import newRoutes from "./routes/new.js";
   app.use("/api/new", newRoutes);
   ```

### Add Frontend Component Using API

```typescript
import { useEffect, useState } from 'react';
import api from '@/services/api';

export function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const result = await api.getBranches();
      setData(result);
    };
    fetch();
  }, []);

  return <div>{/* Render data */}</div>;
}
```

---

## ⚠️ Notes

- All passwords are hashed using bcryptjs before storage
- JWT tokens expire after 24 hours
- Database uses soft deletes (is_active flag) for most entities
- CORS is enabled for localhost:5173 (frontend)
- All timestamps default to current UTC time

---

## 📞 Support

For issues with:
- **Database:** Check MySQL is running in XAMPP
- **Backend:** Check port 3000 is available
- **Frontend:** Check port 8080 is available
- **API calls:** Verify token is stored and included in requests

---

## ✨ Next Steps

1. Implement additional features (Reports, Dashboard, etc.)
2. Add data validation and error handling
3. Implement pagination for list endpoints
4. Add role-based access control (RBAC)
5. Create integration tests
6. Deploy to production server

---

**System Status:** ✅ Fully Operational
- Backend: Running on `http://localhost:3000`
- Frontend: Running on `http://localhost:8080`
- Database: Connected (6 tables created)
