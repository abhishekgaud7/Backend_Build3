# BUILD-SETU Backend API

Production-ready backend API for the BUILD-SETU hyperlocal marketplace for construction materials.

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (email + password)
- **Validation**: Zod
- **Testing**: Vitest
- **Password Hashing**: bcrypt

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app setup
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # JWT authentication & role-based access
│   │   ├── errorHandler.ts  # Error handling & async wrapper
│   │   └── validation.ts    # Request validation (Zod)
│   ├── routes/              # API endpoints
│   │   ├── auth.ts          # Authentication routes
│   │   ├── products.ts      # Product CRUD routes
│   │   ├── categories.ts    # Category routes
│   │   ├── orders.ts        # Order routes
│   │   ├── addresses.ts     # Address management
│   │   └── support.ts       # Support tickets
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── categoryService.ts
│   │   ├── orderService.ts
│   │   ├── addressService.ts
│   │   └── supportService.ts
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utilities (JWT, password hashing, errors)
│   └── lib/                 # External lib setup (Prisma)
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files (auto-generated)
├── .env.example             # Example environment variables
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- PostgreSQL 12+
- pnpm (or npm/yarn)

### Installation

1. Clone the repository and navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/build_setu"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="1h"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

5. Run database migrations:

```bash
pnpm prisma:migrate
```

6. (Optional) Seed the database with sample data:

```bash
pnpm prisma:seed
```

### Development

Start the development server:

```bash
pnpm dev
```

The server will run on `http://localhost:3001`.

### Production Build

```bash
pnpm build
pnpm start
```

## API Documentation

### Authentication

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "BUYER",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response:**

```json
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
    "accessToken": "jwt-token"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Products

#### List Products (Public)

```http
GET /api/products?search=cement&categorySlug=cement&page=1&limit=10
```

#### Get Product Details

```http
GET /api/products/:id
```

#### Create Product (Seller/Admin)

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Portland Cement",
  "description": "High-quality cement",
  "price": "500.00",
  "unit": "bag",
  "categoryId": "uuid",
  "stockQuantity": "100"
}
```

#### Update Product (Seller/Admin)

```http
PUT /api/products/:id
Authorization: Bearer <token>
```

#### Delete Product (Seller/Admin)

```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Categories

#### List Categories

```http
GET /api/categories
```

#### Get Category by Slug

```http
GET /api/categories/:slug
```

#### Create Category (Admin)

```http
POST /api/categories
Authorization: Bearer <token>
```

### Orders

#### List User Orders

```http
GET /api/orders
Authorization: Bearer <token>
```

#### Get Order Details

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Create Order

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": "5"
    }
  ],
  "addressId": "uuid"
}
```

#### Update Order Status (Admin/Seller)

```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

### Addresses

#### List User Addresses

```http
GET /api/addresses
Authorization: Bearer <token>
```

#### Create Address

```http
POST /api/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Home",
  "line1": "123 Main Street",
  "line2": "Apartment 4B",
  "city": "Gwalior",
  "state": "MP",
  "pincode": "474001",
  "isDefault": false
}
```

#### Update Address

```http
PUT /api/addresses/:id
Authorization: Bearer <token>
```

#### Delete Address

```http
DELETE /api/addresses/:id
Authorization: Bearer <token>
```

### Support Tickets

#### List Support Tickets

```http
GET /api/support
Authorization: Bearer <token>
```

#### Get Ticket Details

```http
GET /api/support/:id
Authorization: Bearer <token>
```

#### Create Support Ticket

```http
POST /api/support
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Issue with order",
  "description": "I have not received my order"
}
```

#### Add Message to Ticket

```http
POST /api/support/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I need help with this issue"
}
```

#### Update Ticket Status (Admin)

```http
PUT /api/support/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **BUYER**: Can browse products, create orders, manage addresses
- **SELLER**: Can create/manage products, update order status
- **ADMIN**: Full access to all endpoints

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

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (Validation error)
- `401`: Unauthorized (Missing/invalid token)
- `403`: Forbidden (Insufficient permissions)
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Security

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 1 hour (configurable via `JWT_EXPIRY`)
- All inputs are validated with Zod schemas
- CORS is configured to allow only specified origins
- Sensitive errors are not exposed to clients

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/build_setu

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=1h

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Database

### Running Migrations

```bash
# Create and run migrations
pnpm prisma:migrate

# View Prisma Studio UI
npx prisma studio
```

### Schema Updates

1. Modify `prisma/schema.prisma`
2. Run `pnpm prisma:migrate` to generate migration
3. Review the migration file in `prisma/migrations/`
4. The migration is applied automatically

## Testing

Run unit tests:

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

## Important Notes

### Authentication

- **No SMS/OTP**: Authentication is email + password only
- **Phone Number**: Stored as profile data, not used for login
- **JWT-based**: Stateless authentication using signed tokens
- **Access Token**: Includes user ID, email, and role

### Product Management

- Products have unique slugs (auto-generated from name)
- Stock tracking is optional but available
- Soft delete: `isActive` flag instead of hard delete
- Only sellers can manage their own products

### Orders

- Automatic tax calculation (5% of subtotal)
- Fixed delivery fee (50 currency units)
- Items are validated against current product data
- Prices are always calculated server-side from database

### Authorization

- Users can only access their own resources
- Admins can access all resources
- Sellers can only manage their own products
- Clear role-based access control on all endpoints

## Deployment

### Environment Setup

Before deploying, ensure these are set in production:

```env
NODE_ENV=production
JWT_SECRET=<strong-random-key>
DATABASE_URL=<production-database-url>
CORS_ORIGIN=<your-frontend-domain>
```

### Database

The application uses PostgreSQL. For production:

1. Create a managed PostgreSQL instance
2. Set `DATABASE_URL` to production database
3. Run migrations: `pnpm prisma:migrate deploy`

### Server

Deploy using your preferred platform:

- Heroku: `git push heroku main`
- Railway: Connect GitHub repository
- DigitalOcean: Docker deployment
- AWS: Lambda, ECS, or EC2

## Monitoring & Logging

- Development: Logs all queries
- Production: Logs warnings and errors only

Customize logging in `src/lib/prisma.ts`.

## Contributing

1. Create feature branches from `main`
2. Follow TypeScript strict mode
3. Add tests for new features
4. Ensure all types are properly defined

## License

MIT

## Support

For issues or questions about the backend API, please create an issue in the repository.
