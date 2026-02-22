# XAMPP MySQL Setup Guide

## Setup Instructions

This guide will help you set up the Stock Requisition Hub with XAMPP's local MySQL database.

### Prerequisites
- XAMPP installed and running (with Apache and MySQL services)
- Node.js installed
- The project files ready

### Step 1: Start XAMPP Services

1. Open XAMPP Control Panel
2. Start both **Apache** and **MySQL** services
3. Verify MySQL is running (check the port, typically 3306)

### Step 2: Install Dependencies

Navigate to the server directory and install npm packages:

```bash
cd server
npm install
```

This will install the MySQL driver (`mysql2`) that replaces the PostgreSQL driver.

### Step 3: Create the Database

Run the database setup script to create the `gmpc_requisition` database:

```bash
npm run setup-db
```

**Output should show:**
```
Creating database 'gmpc_requisition' if it doesn't exist...
✓ Database 'gmpc_requisition' is ready!
```

### Step 4: Run Database Migrations

Create all necessary tables:

```bash
npm run migrate
```

**Output should show:**
```
Starting database migration...
✓ Database migration completed successfully!
```

### Step 5: Start the Server

For development with auto-reload:

```bash
npm run dev
```

Or for production:

```bash
npm start
```

The server will start on `http://localhost:3000`

---

## Configuration

The `.env` file contains the MySQL settings:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gmpc_requisition
DB_USER=root
DB_PASSWORD=
```

**Default XAMPP MySQL credentials:**
- **Host:** localhost
- **Port:** 3306
- **Username:** root
- **Password:** (empty)

If your XAMPP MySQL has a password, update the `DB_PASSWORD` value in `.env`

---

## Verification

To verify everything is working:

1. Check XAMPP Control Panel - MySQL should be running
2. Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
3. Look for the `gmpc_requisition` database
4. Check that all tables are created:
   - `branches`
   - `suppliers`
   - `users`
   - `inventory`
   - `requisitions`
   - `requisition_items`

---

## Troubleshooting

### "Cannot connect to MySQL"
- Verify MySQL service is running in XAMPP
- Check port 3306 is not blocked
- Verify host is `localhost` or `127.0.0.1`

### "Database creation failed"
- Ensure MySQL service is running
- Check credentials in `.env` file
- Verify no database already exists (if error persists, your credentials may be wrong)

### "Migration failed"
- Run `-npm run setup-db` first to ensure database exists
- Check that all MySQL services are running
- Review error message for specific table/schema issues

### "Server won't start"
- Ensure all dependencies are installed: `npm install`
- Check port 3000 is not in use
- Verify `.env` file has correct configuration

---

## Database Access via phpMyAdmin

1. Open browser: `http://localhost/phpmyadmin`
2. Login with:
   - **Username:** root
   - **Password:** (leave blank)
3. Select `gmpc_requisition` database from left sidebar
4. View and manage tables and data

---

## Next Steps

After successful setup:
1. Go back to project root directory
2. Install frontend dependencies: `npm install`
3. Start the frontend: `npm run dev`
4. Access the application at `http://localhost:5173` (or as indicated by Vite)

---

## Notes

- The migration is idempotent (safe to run multiple times)
- All table changes will be preserved - tables are only created if they don't exist
- Character set is UTF-8 (utf8mb4) for proper emoji and special character support
