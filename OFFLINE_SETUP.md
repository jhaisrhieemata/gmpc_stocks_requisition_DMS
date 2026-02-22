# Offline Setup Guide - GMPC Stocks Requisition DMS

This document provides instructions for running the GMPC Stocks Requisition System completely offline using locally cached dependencies.

## Prerequisites

- Node.js (v16 or higher) - Already installed with npm
- XAMPP (MySQL database server)
- All dependencies installed locally in `node_modules` folders

## Installation Status

✅ **Frontend dependencies installed** at: `./node_modules/`
✅ **Backend dependencies installed** at: `./server/node_modules/`

All required packages are cached locally and available for offline use.

## Running the System Offline

### 1. Start MySQL Database Server (XAMPP)

```powershell
# If using XAMPP on Windows
# Open XAMPP Control Panel and click "Start" for MySQL
# OR from command line:
cd C:\xampp
.\mysql\bin\mysql.exe -u root
```

### 2. Start the Backend Server

```powershell
cd c:\xampp\htdocs\gmpc_stocks_requisition_DMS\server
npm start
# Server will run on http://localhost:3000
```

### 3. Start the Frontend Development Server (New Terminal)

```powershell
cd c:\xampp\htdocs\gmpc_stocks_requisition_DMS
npm run dev
# Frontend will be available at http://localhost:5173 (or shown in terminal)
```

### 4. Build for Production (Optional)

```powershell
cd c:\xampp\htdocs\gmpc_stocks_requisition_DMS
npm run build
# Creates optimized build in 'dist' folder
```

## Available npm Scripts

### Frontend (Root Directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build with development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Backend (Server Directory)
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run setup-db` - Initialize database schema
- `npm run reset-db` - Reset database to initial state
- `npm run migrate` - Run database migrations
- `npm test` - Run tests

## Database Setup (First Time Only)

```powershell
# Navigate to server directory
cd c:\xampp\htdocs\gmpc_stocks_requisition_DMS\server

# 1. Setup database structure and tables
npm run setup-db

# Or reset existing database
npm run reset-db
```

## Environment Configuration

Ensure `.env` file exists in the `server` directory with proper database configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gmpc_requisition
DB_PORT=3306
PORT=3000
JWT_SECRET=your_jwt_secret_here
```

## Offline Features

✅ Frontend components cache locally
✅ Backend API runs locally
✅ Database (MySQL) runs locally
✅ No internet required once setup is complete
✅ All dependencies available in `node_modules`

## Troubleshooting

### Dependencies Not Found
- If you see "module not found" errors, reinstall:
  ```powershell
  npm install  # in root directory
  cd server && npm install  # in server directory
  ```

### MySQL Connection Errors
- Ensure XAMPP MySQL is running
- Check database credentials in `.env` file
- Verify MySQL port (default: 3306)

### Port Already in Use
- Change port in frontend: `npm run dev` and specify port
- Change backend port in `.env` file (default: 3000)

### Database Errors
```powershell
cd server
npm run reset-db  # Reset database
npm run setup-db  # Reinitialize
```

## Network Status Detection

The system includes a built-in `NetworkStatusModal` component that detects when internet is unavailable. No external connections are required for basic operation.

## Performance Optimization for Offline

All static assets and node_modules are cached locally, providing optimal performance when running offline without network latency.

## Additional Notes

- Front-end is built with React, TypeScript, and Vite
- Back-end is Node.js with Express and MySQL
- UI components use Shadcn/UI built on Radix UI
- Both services are designed to work without external APIs
