# GMPC Stocks Requisition DMS - Quick Reference (Offline)

## 🚀 Quick Start (Recommended)

### Option 1: Using Batch File (Windows)
```powershell
# Just double-click this file:
.\start-offline.bat
```

### Option 2: Using PowerShell Script
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-offline.ps1
```

### Option 3: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```powershell
cd server
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
# Runs on http://localhost:5173
```

---

## ✅ Pre-Requirements Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] XAMPP MySQL running (or any MySQL server)
- [ ] All dependencies installed (already done!)
  - [ ] Frontend: `./node_modules/` exists
  - [ ] Backend: `./server/node_modules/` exists

---

## 📦 Installation Status

✅ **Frontend dependencies** - All installed (700+ packages)
✅ **Backend dependencies** - All installed (128 packages)
✅ **Ready for offline operation** - No internet needed!

---

## 🗄️ Database Setup (One-Time)

```powershell
cd server

# Initialize database (first time)
npm run setup-db

# OR reset if database exists
npm run reset-db
```

---

## 📋 Common Commands

### Frontend Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |
| `npm test` | Run unit tests |

### Backend Commands
| Command | Purpose |
|---------|---------|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm run setup-db` | Initialize database |
| `npm run reset-db` | Reset database to initial state |
| `npm run migrate` | Run migrations |

---

## 🔌 Offline Features

✅ **No internet required** - All dependencies cached locally
✅ **Local database** - MySQL runs on your machine
✅ **Fast performance** - No network latency
✅ **Complete functionality** - All features work offline
✅ **Network detection** - App detects when offline

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend UI | http://localhost:5173 | Web application |
| Backend API | http://localhost:3000 | API server |
| MySQL | localhost:3306 | Database (XAMPP) |

---

## 🆘 Troubleshooting

### Module Not Found Error
```powershell
# Reinstall dependencies
npm install              # Root directory
cd server && npm install # Server directory
```

### MySQL Connection Failed
- ✓ Start XAMPP MySQL service
- ✓ Check `.env` file in server folder
- ✓ Verify database credentials

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual ID)
taskkill /PID <PID> /F

# Or change port in .env
```

### Database Errors
```powershell
cd server
npm run reset-db  # Reset everything
npm run setup-db  # Reinitialize
```

---

## 📂 Project Structure

```
gmpc_stocks_requisition_DMS/
├── src/                  # Frontend React code
├── server/              # Backend Express code
├── node_modules/        # Frontend dependencies ✅
├── server/node_modules/ # Backend dependencies ✅
├── OFFLINE_SETUP.md     # Detailed offline guide
├── start-offline.bat    # Auto-start script (Windows)
└── start-offline.ps1    # Auto-start script (PowerShell)
```

---

## ⚙️ Configuration

**Backend (.env file in /server):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gmpc_requisition
DB_PORT=3306
PORT=3000
JWT_SECRET=your_secret_key
```

---

## 📊 Technology Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React 18, TypeScript, Vite | User interface |
| Backend | Node.js, Express | API server |
| Database | MySQL | Data storage |
| UI | Shadcn/UI, Radix UI, Tailwind CSS | Components |

---

## 🎯 What's Working Offline

✅ User authentication
✅ Requisition management
✅ Inventory tracking
✅ Branch management
✅ User management
✅ All CRUD operations
✅ Dashboard & reports
✅ Data persistence

---

## 💾 Backup & Restore

### Backup Database
```powershell
cd server
mysqldump -u root gmpc_requisition > backup.sql
```

### Restore Database
```powershell
mysql -u root gmpc_requisition < backup.sql
```

---

## 🔒 Security Notes

- Change JWT_SECRET in .env before production
- Use strong database password in production
- Restrict API access if exposed to network
- Keep dependencies updated with `npm update`

---

## 📞 Support

For detailed information, see:
- [OFFLINE_SETUP.md](./OFFLINE_SETUP.md) - Complete setup guide
- [API_IMPLEMENTATION.md](./API_IMPLEMENTATION.md) - API documentation
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Database schema

---

**Last Updated:** February 2026
**Status:** ✅ Ready for Offline Operation
