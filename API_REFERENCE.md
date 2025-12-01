# BUILD-SETU API Reference

Quick reference for all API endpoints, request/response formats, and authentication.

## Base URL

```
http://localhost:3001/api
```

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

Token is received after login/register and should be stored in localStorage.

---

## Authentication Endpoints

### Register

```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "BUYER",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

Response: 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "BUYER",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 200
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Get Current User

```
GET /auth/me
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "BUYER",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Logout

```
POST /auth/logout
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Product Endpoints

### List Products (Public)

```
GET /products?search=cement&categorySlug=cement&page=1&limit=10

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Portland Cement 50kg",
      "slug": "portland-cement-50kg",
      "description": "High-quality cement",
      "price": "500.00",
      "unit": "bag",
      "categoryId": "uuid",
      "sellerId": "uuid",
      "stockQuantity": 100,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Get Product Details

```
GET /products/:id

Response: 200
{
  "success": true,
  "data": { ... product object ... }
}
```

### Create Product (Seller/Admin)

```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Portland Cement",
  "description": "High-quality cement for construction",
  "price": "500.00",
  "unit": "bag",
  "categoryId": "uuid",
  "stockQuantity": "100"
}

Response: 201
{
  "success": true,
  "data": { ... product object ... }
}
```

### Update Product (Seller/Admin)

```
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": "550.00",
  "stockQuantity": "150"
}

Response: 200
{
  "success": true,
  "data": { ... updated product object ... }
}
```

### Delete Product (Seller/Admin)

```
DELETE /products/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

---

## Category Endpoints

### List Categories (Public)

```
GET /categories

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Cement",
      "slug": "cement",
      "description": "Portland cement and cement products",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Category by Slug (Public)

```
GET /categories/:slug

Response: 200
{
  "success": true,
  "data": { ... category object ... }
}
```

### Create Category (Admin)

```
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Doors & Windows",
  "description": "Doors, windows, and frames"
}

Response: 201
{
  "success": true,
  "data": { ... category object ... }
}
```

### Update Category (Admin)

```
PUT /categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}

Response: 200
{
  "success": true,
  "data": { ... updated category object ... }
}
```

### Delete Category (Admin)

```
DELETE /categories/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  }
}
```

---

## Order Endpoints

### List Orders

```
GET /orders?page=1&limit=10
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "PENDING",
      "subtotal": "1000.00",
      "tax": "50.00",
      "deliveryFee": "50.00",
      "total": "1100.00",
      "addressId": "uuid",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "unitPrice": "500.00",
          "lineTotal": "1000.00"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Order Details

```
GET /orders/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": { ... order object ... }
}
```

### Create Order

```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": "5"
    },
    {
      "productId": "uuid",
      "quantity": "2"
    }
  ],
  "addressId": "uuid"
}

Response: 201
{
  "success": true,
  "data": { ... order object with calculated totals ... }
}
```

### Update Order Status (Seller/Admin)

```
PUT /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED"
}

Status options: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

Response: 200
{
  "success": true,
  "data": { ... updated order object ... }
}
```

---

## Address Endpoints

### List User Addresses

```
GET /addresses
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "label": "Home",
      "line1": "123 Main Street",
      "line2": "Apt 4B",
      "city": "Gwalior",
      "state": "MP",
      "pincode": "474001",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Address Details

```
GET /addresses/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": { ... address object ... }
}
```

### Create Address

```
POST /addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Home",
  "line1": "123 Main Street",
  "line2": "Apt 4B",
  "city": "Gwalior",
  "state": "MP",
  "pincode": "474001",
  "isDefault": false
}

Response: 201
{
  "success": true,
  "data": { ... address object ... }
}
```

### Update Address

```
PUT /addresses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Office",
  "line1": "456 Park Avenue",
  "city": "Gwalior",
  "state": "MP",
  "pincode": "474002"
}

Response: 200
{
  "success": true,
  "data": { ... updated address object ... }
}
```

### Delete Address

```
DELETE /addresses/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "message": "Address deleted successfully"
  }
}
```

---

## Support Ticket Endpoints

### List Support Tickets

```
GET /support?page=1&limit=10
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "subject": "Issue with order",
      "description": "I have not received my order",
      "status": "OPEN",
      "messages": [
        {
          "id": "uuid",
          "ticketId": "uuid",
          "senderType": "USER",
          "message": "I need help with this",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Ticket Details

```
GET /support/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": { ... ticket object with messages ... }
}
```

### Create Support Ticket

```
POST /support
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Problem with delivery",
  "description": "The delivered items were damaged"
}

Response: 201
{
  "success": true,
  "data": { ... ticket object ... }
}
```

### Add Message to Ticket

```
POST /support/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Can you please check this issue?"
}

Response: 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticketId": "uuid",
    "senderType": "USER",
    "message": "Can you please check this issue?",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Ticket Status (Admin)

```
PUT /support/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}

Status options: OPEN, IN_PROGRESS, RESOLVED, CLOSED

Response: 200
{
  "success": true,
  "data": { ... updated ticket object ... }
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": null
  }
}
```

### Common Error Codes

| Status | Code                 | Message                   |
| ------ | -------------------- | ------------------------- |
| 400    | VALIDATION_ERROR     | Request validation failed |
| 401    | AUTHENTICATION_ERROR | Missing or invalid token  |
| 403    | AUTHORIZATION_ERROR  | Insufficient permissions  |
| 404    | NOT_FOUND            | Resource not found        |
| 409    | CONFLICT             | Resource already exists   |
| 500    | INTERNAL_ERROR       | Server error              |

---

## Role-Based Access

### Public Access

- `GET /products`
- `GET /products/:id`
- `GET /categories`
- `GET /categories/:slug`

### BUYER Access

- All public endpoints
- `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `DELETE /addresses/:id`
- `GET /orders`, `GET /orders/:id`, `POST /orders`
- `GET /support`, `POST /support`, `POST /support/:id/messages`, `GET /support/:id`

### SELLER Access

- All buyer endpoints
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
- `PUT /orders/:id/status` (update order status)

### ADMIN Access

- All endpoints

---

## Example JavaScript Client Usage

```javascript
// Login
const loginResponse = await fetch("http://localhost:3001/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});

const { data } = await loginResponse.json();
const token = data.accessToken;

// Fetch protected resource
const ordersResponse = await fetch("http://localhost:3001/api/orders", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const ordersData = await ordersResponse.json();
console.log(ordersData.data); // Array of orders
```

---

## Rate Limiting

Currently no rate limiting. Production deployment should implement:

- 100 requests/minute per IP
- 1000 requests/minute per authenticated user

---

## CORS

CORS is enabled for:

```
http://localhost:5173  (Development)
```

Update `CORS_ORIGIN` environment variable for production deployment.

---

## Testing Credentials

Test users created by seed script:

| Email              | Password      | Role   |
| ------------------ | ------------- | ------ |
| buyer@example.com  | TestBuyer123  | BUYER  |
| seller@example.com | TestSeller123 | SELLER |
| admin@example.com  | TestAdmin123  | ADMIN  |

---

## Changelog

### v1.0.0 (Initial Release)

- Authentication (register, login, logout)
- Products CRUD
- Categories
- Orders management
- Address management
- Support tickets
