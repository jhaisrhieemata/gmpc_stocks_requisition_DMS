# PostgreSQL to MySQL Migration Summary

## Changes Made

This document outlines all changes made to switch from PostgreSQL to MySQL for XAMPP local development.

### 1. **Package Dependencies**
   - **Removed:** `pg@^8.11.3` (PostgreSQL driver)
   - **Added:** `mysql2@^3.6.5` (MySQL driver)
   - **File:** [server/package.json](server/package.json)

### 2. **Database Configuration**
   - **File:** [server/src/config/database.js](server/src/config/database.js)
   - **Changes:**
     - Switched from `pg` Pool to `mysql2/promise` connection pool
     - Updated default port: 5432 → 3306
     - Updated default user: postgres → root
     - Updated default password: empty (unchanged)
     - Modified query execution to work with MySQL promises API
     - Updated logging to handle MySQL response format

### 3. **Database Migration Script**
   - **File:** [server/scripts/migrate.js](server/scripts/migrate.js)
   - **Changes:**
     - Replaced PostgreSQL driver with MySQL driver
     - Converted SQL syntax from PostgreSQL to MySQL:
       - `SERIAL PRIMARY KEY` → `INT AUTO_INCREMENT PRIMARY KEY`
       - `INTEGER` → `INT`
       - `TEXT` → `LONGTEXT` (for signature_data)
       - Converted inline foreign keys to separate FOREIGN KEY constraints
     - Updated connection pool configuration
     - Updated migration function to use mysql2/promise API

### 4. **New Database Setup Script**
   - **File:** [server/scripts/setup-db.js](server/scripts/setup-db.js)
   - **Purpose:** Creates the MySQL database before running migrations
   - **Required:** Must run this before the migration script

### 5. **Environment Configuration**
   - **File:** [server/.env](server/.env)
   - **Configuration:**
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=gmpc_requisition
     DB_USER=root
     DB_PASSWORD=
     ```

### 6. **Updated NPM Scripts**
   - **File:** [server/package.json](server/package.json)
   - **New scripts:**
     - `npm run setup-db` - Create the database
     - `npm run migrate` - Run database migrations
     - `npm start` - Start server
     - `npm run dev` - Start with auto-reload

### 7. **Setup Documentation**
   - **File:** [server/MYSQL_SETUP.md](server/MYSQL_SETUP.md)
   - Complete step-by-step guide for local XAMPP setup

---

## Quick Start

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Create database:**
   ```bash
   npm run setup-db
   ```

3. **Run migrations:**
   ```bash
   npm run migrate
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

---

## XAMPP MySQL Connection Details

- **Host:** localhost
- **Port:** 3306
- **Username:** root
- **Password:** (empty)
- **Database:** gmpc_requisition

Ensure MySQL service is running in XAMPP Control Panel before executing setup commands.

---

## API Changes

The query interface remains the same, maintaining backward compatibility:

```javascript
import { query } from './config/database.js';

// Same usage as before
const result = await query('SELECT * FROM users WHERE id = ?', [userId]);
```

---

## No Client-Side Changes Required

The frontend code remains unchanged as it only communicates via API endpoints.
