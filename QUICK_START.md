# 🚀 Quick Start Guide - खर्चप्रबंधक

## Step 1: Prerequisites

Make sure you have installed:
- ✅ Node.js v18+ ([Download](https://nodejs.org))
- ✅ MongoDB ([Local Setup](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- ✅ Git

Verify installations:
```bash
node --version    # Should show v18+
npm --version     # Should show 8+
mongod --version  # Optional, if using local MongoDB
```

---

## Step 2: Clone & Setup Project

### 2.1 Clone the Repository
```bash
git clone <your-repo-url>
cd ExpenceTracker
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install:
- express (Web framework)
- mongoose (Database)
- cors (Cross-origin)
- helmet (Security)
- dotenv (Config)
- plotly.js (Charts)
- tailwindcss (Styling)

---

## Step 3: Configure MongoDB

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition**
   - Windows: [Download Installer](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: [Installation Guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB Service**
   - Windows: `mongod` in command prompt
   - Mac/Linux: `brew services start mongodb-community`

3. **Default Connection String in .env**
   ```
   MONGODB_URI=mongodb://localhost:27017/expensetracker
   ```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create organization and project

2. **Create Cluster**
   - Click "Create" button
   - Choose free tier (M0)
   - Select region closest to you
   - Create cluster (takes 1-2 minutes)

3. **Get Connection String**
   - Click "Connect" button
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password

4. **Update .env**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expensetracker
   ```

---

## Step 4: Environment Configuration

### 4.1 Create .env File
```bash
cp .env.example .env
```

### 4.2 Edit .env File
```bash
# Windows
notepad .env

# Mac/Linux
nano .env
```

### 4.3 Configure Values
```
NODE_ENV=development              # development or production
PORT=8080                         # Server port
MONGODB_URI=mongodb://localhost:27017/expensetracker  # Your MongoDB URL
JWT_SECRET=your_secret_key_here   # Change this to random string
CORS_ORIGIN=*                     # Allow all origins in development
LOG_LEVEL=debug                   # Logging level
```

### 4.4 Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste into `JWT_SECRET` in .env

---

## Step 5: Start the Application

### 5.1 Development Mode
```bash
npm start
```

You should see:
```
Server is running on http://localhost:8080
Connected to MongoDB
```

### 5.2 With Auto-Reload (Optional)
Install nodemon:
```bash
npm install --save-dev nodemon
```

Add to package.json:
```json
"dev": "nodemon index.js"
```

Run:
```bash
npm run dev
```

---

## Step 6: Access the Application

### 6.1 Open in Browser
```
http://localhost:8080
```

### 6.2 First Time Setup
1. You'll be prompted to enter your name
2. Choose your preferences (language, currency)
3. Start adding transactions!

---

## 📱 Using the Application

### Main Dashboard
- View monthly statistics
- Add new transactions
- See category breakdown
- Filter by month or category

### Analytics Page
- View yearly trends
- Analyze spending patterns
- Export data
- Compare months

### Budget Management
- Set monthly budgets
- Track spending
- Get alerts when exceeding limits

### Financial Goals
- Create saving targets
- Track progress
- Set priorities
- Update achievements

### Settings
- Change language and currency
- Export/Import data
- View user info
- Dark mode toggle

---

## 🔧 Troubleshooting

### Issue: "Port already in use"
```bash
# Change PORT in .env to different number (e.g., 3000)
PORT=3000
# Or kill process using port 8080
# Windows: netstat -ano | findstr :8080
# Mac/Linux: lsof -i :8080
```

### Issue: "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
# Windows: Check Task Manager for mongod.exe
# Mac/Linux: brew services list
# Make sure MONGODB_URI is correct in .env
```

### Issue: "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "Page shows blank or errors"
```bash
# Check browser console (F12)
# Check server logs for errors
# Clear browser cache (Ctrl+Shift+Delete)
# Hard refresh (Ctrl+F5 or Cmd+Shift+R)
```

---

## 📊 Database Initialization

### First Time Data
The application automatically creates:
- Collections for users
- Collections for transactions
- Collections for budgets
- Collections for goals

### Sample Data (Optional)
To add sample data for testing:

1. Create a new file `seed.js`:
```javascript
const mongoose = require('mongoose');
require('dotenv').config();
const { User } = require('./models/schemas');

const sampleData = {
  _id: 'TestUser',
  transactions: [
    {
      date: new Date('2024-01-15'),
      amount: 5000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly salary',
      notes: 'Payment from employer'
    }
  ]
};

mongoose.connect(process.env.MONGODB_URI).then(() => {
  User.create(sampleData);
  console.log('Sample data added!');
  process.exit(0);
});
```

2. Run it:
```bash
node seed.js
```

---

## 🛠️ Development Tips

### Working with APIs
Use Postman or Insomnia to test endpoints:
```bash
POST http://localhost:8080/api/transactions/create
Content-Type: application/json

{
  "user": "TestUser",
  "date": "2024-01-15",
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "description": "Monthly salary"
}
```

### Database Inspection
Install MongoDB Compass (GUI):
```bash
# Download from https://www.mongodb.com/products/compass
# Connect to mongodb://localhost:27017
# Browse collections and data
```

### Server Logs
Check console for debug information:
```bash
npm start
# Look for [INFO], [ERROR], [DEBUG] messages
```

### Frontend Console
Check browser DevTools (F12):
- Console tab for JavaScript errors
- Network tab for API calls
- Storage tab for localStorage data

---

## 📦 Production Deployment

### Heroku Example
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_url
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Render Example
```bash
# Create account on render.com
# Connect your GitHub repo
# Set environment variables
# Deploy with one click
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas (don't expose local MongoDB)
- [ ] Update CORS_ORIGIN to your domain only
- [ ] Enable HTTPS (use Render, Heroku, or Vercel)
- [ ] Add rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use strong database password
- [ ] Add backup strategy
- [ ] Monitor logs and errors

---

## 📞 Need Help?

### Resources
- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)

### Common Commands
```bash
# Start server
npm start

# Install new package
npm install package-name

# Uninstall package
npm uninstall package-name

# Update packages
npm update

# Check for outdated packages
npm outdated

# Run custom script
npm run scriptname
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] .env file created and configured
- [ ] `npm install` completed
- [ ] `npm start` runs without errors
- [ ] Browser opens to `http://localhost:8080`
- [ ] Can add a transaction
- [ ] Dashboard shows transaction
- [ ] All pages load correctly
- [ ] Dark mode toggle works

---

## 🎉 You're Ready!

Once all steps are complete:
1. Start adding your transactions
2. Set budgets for categories
3. Track financial goals
4. Analyze spending patterns
5. Export your data

Enjoy managing your finances! 💰

---

**Version:** 1.0.0
**Last Updated:** 2024
**Status:** Ready to use ✅
