# 🐔 Poultry Farm Management System

A complete MongoDB-based poultry farm management dashboard with multi-user authentication.

## ✅ Node.js Upgrade Complete!

Node.js 20.19.6 has been installed successfully. **Please open a NEW terminal window** to use it.

## 🚀 Quick Start

### 1. Open a New Terminal (Important!)

Close this terminal and open a fresh one:
- **PowerShell** (Recommended)
- **Command Prompt**
- **Windows Terminal**

### 2. Verify Node.js Version

```bash
node -v
# Should show: v20.19.6

npm -v
# Should show: 10.x.x
```

### 3. Configure MongoDB

Edit `.env.local` and add your MongoDB Atlas credentials:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/poultry-farm?retryWrites=true&w=majority
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

**Get MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 Free)
4. Create database user
5. Get connection string

**Generate Secret:**
```bash
openssl rand -base64 32
```

### 4. Start the Development Server

**Option A: Using startup scripts (Recommended)**

For **Command Prompt**:
```bash
cd C:\work\poultry-farm
start.bat
```

For **PowerShell**:
```powershell
cd C:\work\poultry-farm
.\start.ps1
```

**Option B: Manual activation**

If you get "npm is not recognized", activate Node.js first:
```bash
nvm use 20.19.6
npm run dev
```

### 5. Open in Browser

Visit: http://localhost:3000

1. Click **"Create Account"**
2. Register your user
3. Sign in
4. Start managing your farm!

## 📋 Features

✅ Multi-user authentication
✅ Batch management (track bird groups)
✅ Mortality tracking (auto-reduce batch size)
✅ Egg production logging
✅ Incubator management (auto-add hatched chicks)
✅ Feed purchase tracking
✅ Vaccination scheduling
✅ Browser notifications for overdue vaccines
✅ Monthly egg production charts
✅ Dark mode

## 🗂️ Project Structure

```
app/
├── (auth)/           # Login & Registration
├── (dashboard)/      # Main Dashboard
└── api/             # 15+ API Routes

components/
├── dashboard/        # Summary Cards, Charts, Tables
├── dialogs/          # 6 Action Dialogs
├── theme/           # Dark Mode
└── notifications/   # Vaccine Reminders

lib/
├── models/          # 7 Mongoose Models
├── auth/            # NextAuth Config
└── validations/     # Zod Schemas
```

## 📚 Documentation

- **Setup Guide**: See `SETUP.md` for detailed instructions
- **API Docs**: All routes documented in SETUP.md
- **Business Logic**: Explained in SETUP.md

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: NextAuth.js v5
- **Charts**: recharts
- **Validation**: Zod

## 🎯 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## ❗ Troubleshooting

### "npm is not recognized" error
- **Cause**: nvm requires you to activate the Node.js version in each new terminal
- **Solution**: Run `nvm use 20.19.6` before running npm commands
- **Better Solution**: Use the startup scripts (`start.bat` or `start.ps1`) which do this automatically

### Node.js version error
- **Solution**: Run `nvm use 20.19.6` to activate the correct version
- nvm doesn't set a default version globally on Windows

### MongoDB connection failed
- Check `.env.local` has correct credentials
- Verify MongoDB Atlas allows your IP (0.0.0.0/0 for dev)
- Test connection string in MongoDB Compass

### "Module not found" errors
- Run: `npm install` again in new terminal

### Dark mode not working
- Clear browser cache and localStorage
- Hard refresh: Ctrl + Shift + R

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT-based sessions
- All API routes protected
- User data isolation
- Input validation with Zod

## 📝 License

Custom-built application for poultry farm management.

---

**Need Help?** Check `SETUP.md` for detailed troubleshooting and configuration.
