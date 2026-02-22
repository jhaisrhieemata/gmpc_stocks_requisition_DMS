# GMPC Requisition System - Node.js/Express Backend

This is the backend API server for the GMPC Requisition System, built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the server root directory:

```bash
cp .env.example .env
```

3. Update the `.env` file with your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gmpc_requisition
DB_USER=postgres
DB_PASSWORD=your_password_here
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000/api
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=http://localhost:5173
```

4. Create the PostgreSQL database:

```bash
createdb gmpc_requisition -U postgres
```

5. Run database migrations:

```bash
npm run migrate
```

## Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

- **Health Check**: `GET /api/health`
- **Authentication**: `/api/auth/` (to be implemented)
- **Users**: `/api/users/` (to be implemented)
- **Inventory**: `/api/inventory/` (to be implemented)
- **Requisitions**: `/api/requisitions/` (to be implemented)
- **Suppliers**: `/api/suppliers/` (to be implemented)
- **Branches**: `/api/branches/` (to be implemented)
- **Dashboard**: `/api/dashboard/` (to be implemented)

## Database Schema

The following tables are created during migration:

- `branches` - Branch information
- `suppliers` - Supplier information
- `users` - User accounts with roles
- `inventory` - Stock inventory items
- `requisitions` - Requisition records
- `requisition_items` - Individual items in requisitions

## Project Structure

```
server/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   └── database.js        # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   └── routes/                # API route handlers
├── scripts/
│   └── migrate.js             # Database migration script
├── index.js                   # Server entry point
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Environment Variables

- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `API_URL` - Full API URL
- `SESSION_SECRET` - Secret key for sessions
- `CORS_ORIGIN` - CORS origin URL

## Next Steps

1. Implement authentication routes (`/api/auth/`)
2. Implement user routes (`/api/users/`)
3. Implement inventory routes (`/api/inventory/`)
4. Implement requisition routes (`/api/requisitions/`)
5. Implement supplier routes (`/api/suppliers/`)
6. Implement branch routes (`/api/branches/`)
7. Implement dashboard routes (`/api/dashboard/`)

## Database Connection Notes

This backend uses PostgreSQL instead of MySQL. Make sure:

- PostgreSQL is installed and running
- The database `gmpc_requisition` is created
- Your credentials in `.env` are correct
- You've run the migration script to create tables

## Security Considerations

- Always use HTTPS in production
- Keep `.env` file out of version control (add to `.gitignore`)
- Use strong session secrets
- Validate and sanitize all inputs
- Use prepared statements (handled by pg library)
- Implement rate limiting for production
