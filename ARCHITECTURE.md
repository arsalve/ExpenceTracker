# 🏗️ Architecture Documentation - खर्चप्रबंधक

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Design](#database-design)
7. [API Endpoints](#api-endpoints)
8. [Data Flow](#data-flow)
9. [Security Architecture](#security-architecture)
10. [Scalability Considerations](#scalability-considerations)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  HTML Pages (Tailwind CSS)                          │   │
│  │  ┌──────────────┬──────────────┬──────────────┐    │   │
│  │  │  Dashboard   │  Analytics   │  Budgets     │    │   │
│  │  │  Goals       │  Settings    │              │    │   │
│  │  └──────────────┴──────────────┴──────────────┘    │   │
│  │                                                      │   │
│  │  JavaScript Managers                                │   │
│  │  ┌──────────────┬──────────────┬──────────────┐    │   │
│  │  │ ExpenseTracker│ BudgetMgr   │ GoalManager │    │   │
│  │  │ InsightsMgr  │ SettingsMgr │              │    │   │
│  │  └──────────────┴──────────────┴──────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓ HTTP/REST                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Express.js Server                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                   │   │
│  │  ├─ CORS                                            │   │
│  │  ├─ Helmet (Security)                              │   │
│  │  ├─ Body Parser (JSON/URL-encoded)                 │   │
│  │  └─ Error Handler                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes (routes/api.js)                         │   │
│  │  ├─ /api/transactions/*                             │   │
│  │  ├─ /api/budgets/*                                  │   │
│  │  ├─ /api/goals/*                                    │   │
│  │  ├─ /api/export/*                                   │   │
│  │  └─ /api/statistics                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controllers                                        │   │
│  │  ├─ transactionController.js                        │   │
│  │  ├─ planningController.js                           │   │
│  │  └─ exportController.js                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Models (Mongoose Schemas)                          │   │
│  │  ├─ User                                            │   │
│  │  ├─ Transaction                                     │   │
│  │  ├─ Budget                                          │   │
│  │  ├─ Goal                                            │   │
│  │  └─ RecurringTransaction                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Database                            │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │   Users      │ Transactions │ Budgets              │    │
│  │              │              │                      │    │
│  │  _id: String │ _id: String  │ _id: ObjectId        │    │
│  │  name        │ user: String │ user: String         │    │
│  │  email       │ date: Date   │ category: String     │    │
│  │  password    │ amount: Num  │ limit: Number        │    │
│  │  ...         │ type: String │ alert_threshold      │    │
│  │              │ category     │ ...                  │    │
│  │  Goals       │ description  │                      │    │
│  │              │ ...          │ RecurringTxns        │    │
│  │  _id: ObjId  │              │                      │    │
│  │  user: Str   │              │ _id: ObjectId        │    │
│  │  name        │              │ user: String         │    │
│  │  target_amt  │              │ template: Object     │    │
│  │  current_amt │              │ frequency: String    │    │
│  │  ...         │              │ ...                  │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
```
Language: JavaScript (Node.js)
Runtime: Node.js v18+
Framework: Express.js 4.21.2
Database: MongoDB + Mongoose 6.6.5
Security: Helmet.js, CORS, Body-Parser
Environment: Dotenv
```

### Frontend
```
Markup: HTML5
Styling: Tailwind CSS 3.3.0 (via CDN)
Scripts: Vanilla JavaScript (ES6+)
Libraries: jQuery 3.6.0 (optional)
Charts: Plotly.js 2.26.0
Icons: Font Awesome 6.4.2
```

### Development
```
Package Manager: npm 8+
Version Control: Git
Testing: Manual (mocha/jest ready)
Deployment: Node.js hosting platforms
```

---

## Directory Structure

```
ExpenseTracker/
│
├── config/                       # Configuration files
│   ├── database.js              # MongoDB connection setup
│   └── constants.js             # Categories, types, Marathi translations
│
├── controllers/                 # Business logic layer
│   ├── transactionController.js # Transaction CRUD, analytics
│   ├── planningController.js    # Budgets and Goals management
│   └── exportController.js      # Export/Import, statistics
│
├── models/                      # Database schemas
│   └── schemas.js               # Mongoose schemas for all entities
│
├── routes/                      # API route definitions
│   └── api.js                   # All API endpoints with controllers
│
├── Public/                      # Frontend files
│   ├── index.html               # Dashboard (main page)
│   ├── insights.html            # Analytics & insights page
│   ├── budgets.html             # Budget management page
│   ├── goals.html               # Financial goals page
│   ├── settings.html            # Settings & preferences page
│   │
│   ├── app.js                   # Main dashboard logic (ExpenseTracker class)
│   ├── insights.js              # Analytics handler (InsightsManager class)
│   ├── budgets.js               # Budget handler (BudgetManager class)
│   ├── goals.js                 # Goals handler (GoalManager class)
│   ├── settings.js              # Settings handler (SettingsManager class)
│   │
│   ├── styles.css               # Global CSS styles
│   ├── scripts.js               # Utility functions (legacy)
│   └── master.js                # Master script (legacy)
│
├── index.js                     # Main server entry point
├── package.json                 # Dependencies & metadata
├── .env.example                 # Environment variables template
│
├── README.md                    # Project documentation
├── QUICK_START.md              # Setup guide
├── RESTRUCTURING_SUMMARY.md    # What changed overview
├── TESTING_GUIDE.md            # Testing documentation
└── ARCHITECTURE.md             # This file
```

---

## Backend Architecture

### 1. Entry Point (index.js)

```javascript
// Initialization flow:
1. Load environment variables (dotenv)
2. Import dependencies (express, cors, helmet, etc.)
3. Connect to MongoDB (connectDB)
4. Setup middleware (CORS, Helmet, Body Parser)
5. Mount routes (API routes, static files)
6. Setup error handling
7. Start server (app.listen)
```

### 2. Controller Layer

#### transactionController.js
```
Methods:
├─ createTransaction(req, res)
│  └─ Validates input, calculates month/year, generates ID, saves to DB
├─ getTransactions(req, res)
│  └─ Filters by month/year/type/category, returns array
├─ getMonthlySummary(req, res)
│  └─ Aggregates income/expense/savings, returns breakdown
├─ getCategoryBreakdown(req, res)
│  └─ Groups by category, returns distribution
├─ updateTransaction(req, res)
│  └─ Finds and updates transaction in array
└─ deleteTransaction(req, res)
   └─ Removes transaction from user array
```

#### planningController.js (BudgetController & GoalController)
```
BudgetController:
├─ setBudget(req, res)
│  └─ Creates monthly budget with alert threshold
├─ getBudgetStatus(req, res)
│  └─ Calculates spent vs limit, returns status
└─ deleteBudget(req, res)
   └─ Removes budget from user

GoalController:
├─ createGoal(req, res)
│  └─ Creates goal with target amount, current=0
├─ updateGoalProgress(req, res)
│  └─ Updates current amount, auto-completes when reached
├─ getGoals(req, res)
│  └─ Returns all active goals
└─ deleteGoal(req, res)
   └─ Removes goal from user
```

#### exportController.js
```
Methods:
├─ exportJSON(req, res)
│  └─ Packages data, sets download headers
├─ exportCSV(req, res)
│  └─ Converts to CSV format, returns file
├─ importJSON(req, res)
│  └─ Parses JSON, merges with existing data
└─ getStatistics(req, res)
   └─ Calculates totals, breakdowns, monthly trends
```

### 3. Model Layer (Mongoose Schemas)

#### User Schema
```javascript
{
  _id: String (username),
  name: String,
  email: String,
  password: String (hashed, future auth),
  transactions: [TransactionSchema],
  budgets: [BudgetSchema],
  goals: [GoalSchema],
  created_at: Date,
  updated_at: Date
}
```

#### Transaction Schema
```javascript
{
  id: String (unique within user),
  date: Date,
  month: Number (1-12),
  year: Number,
  amount: Number (positive),
  type: Enum (income, expense, savings),
  category: String,
  description: String,
  notes: String,
  tags: [String],
  isRecurring: Boolean,
  recurring_id: String (reference to RecurringTransaction)
}
```

#### Budget Schema
```javascript
{
  category: String,
  limit: Number,
  month: Number (1-12),
  year: Number,
  alert_threshold: Number (0-100, default 80),
  created_at: Date,
  updated_at: Date
}
```

#### Goal Schema
```javascript
{
  name: String,
  target_amount: Number,
  current_amount: Number (default 0),
  target_date: Date,
  priority: Enum (low, medium, high),
  description: String,
  status: Enum (active, completed, abandoned, default active),
  created_at: Date,
  updated_at: Date
}
```

---

## Frontend Architecture

### Design Pattern: Manager Classes

Each page has a dedicated Manager class handling:

```javascript
class PageManager {
  // Properties
  apiBaseUrl      // API endpoint
  currentUser     // User identifier
  
  // Methods
  constructor()         // Initialize
  getApiBaseUrl()       // Determine API path
  getUser()             // Get/prompt user
  initialize()          // Setup listeners, load data
  setupThemeToggle()    // Dark mode
  
  // Data Methods
  loadData()            // Fetch from API
  displayData()         // Render UI
  
  // Event Handlers
  handleSubmit()        // Form submission
  handleDelete()        // Delete operations
}
```

### Page Structure

#### Dashboard (app.js → ExpenseTracker)
```
1. Initialize: Set user, load categories, setup listeners
2. Form Handler: Validate → API POST → Update UI
3. Data Loading: Fetch summary, transactions, breakdown
4. Display: Update stats, render table, draw chart
5. Delete: Confirm → API DELETE → Refresh
```

#### Analytics (insights.js → InsightsManager)
```
1. Initialize: Set year selector, load initial data
2. Year Selection: Load data for selected year
3. Statistics: Calculate totals, breakdowns
4. Charts: Render monthly trends and distributions
5. Export: Download analytics as JSON
```

#### Budgets (budgets.js → BudgetManager)
```
1. Form Handler: Create budget with limit and threshold
2. Load Budgets: Fetch status for current month
3. Display: Show progress bars, status badges
4. Auto-Update: Refresh when transactions change
```

#### Goals (goals.js → GoalManager)
```
1. Form Handler: Create goal with details
2. Load Goals: Fetch all active goals
3. Display: Show progress, amounts, dates
4. Update Progress: Increment towards target
5. Complete: Auto-mark when target reached
```

#### Settings (settings.js → SettingsManager)
```
1. Load Settings: Restore from localStorage
2. Theme Toggle: Switch dark/light mode
3. Preferences: Language, currency selection
4. Export: JSON and CSV download
5. Import: Parse and merge data
6. Clear: Safe data removal
```

### UI Components

#### Navigation
```html
<nav>
  ├─ Logo/Branding
  ├─ Nav Links (Home, Analytics, Budgets, Goals, Settings)
  ├─ Theme Toggle
  └─ Mobile Menu
</nav>
```

#### Stats Cards
```html
<div class="stat-card">
  ├─ Label
  ├─ Value (with currency)
  └─ Icon
</div>
```

#### Forms
```html
<form>
  ├─ Input Fields
  ├─ Select Dropdowns (with categories)
  ├─ Textarea (optional notes)
  └─ Submit Button
</form>
```

#### Data Tables
```html
<table>
  ├─ Headers
  ├─ Data Rows
  └─ Actions (Edit, Delete, Update)
</table>
```

#### Charts (Plotly.js)
```javascript
// Line Chart (Trends)
Plotly.newPlot(element, traces, layout)

// Bar Chart (Distribution)
Plotly.newPlot(element, data, layout)

// Pie Chart (Categories)
Plotly.newPlot(element, data, layout)
```

---

## Database Design

### Data Relationships

```
User (1) ────────→ (Many) Transactions
  ├─────────────→ (Many) Budgets
  ├─────────────→ (Many) Goals
  └─────────────→ (Many) RecurringTransactions

RecurringTransaction ──→ Creates → Transactions (auto)
Budget ────────────→ Tracks → Transactions (same category)
Goal ──────────────→ Funded by → Savings transactions
```

### Indexing Strategy

```javascript
// Recommended MongoDB Indexes
db.users.createIndex({ email: 1 })
db.transactions.createIndex({ user: 1, date: -1 })
db.transactions.createIndex({ user: 1, category: 1 })
db.budgets.createIndex({ user: 1, category: 1, year: 1, month: 1 })
db.goals.createIndex({ user: 1, status: 1 })
```

### Query Patterns

```javascript
// Get user transactions for month
db.users.updateOne(
  { _id: userId },
  { $elemMatch: { month: 1, year: 2024 } }
)

// Calculate category totals
db.users.aggregate([
  { $match: { _id: userId } },
  { $unwind: "$transactions" },
  { $group: { 
      _id: "$transactions.category",
      total: { $sum: "$transactions.amount" }
    }
  }
])
```

---

## API Endpoints

### Transaction Endpoints
```
POST /api/transactions/create      # Add transaction
POST /api/transactions/get         # Get filtered transactions
POST /api/transactions/delete      # Delete transaction
POST /api/transactions/update      # Update transaction
POST /api/transactions/summary     # Monthly summary
POST /api/transactions/breakdown   # Category breakdown
```

### Budget Endpoints
```
POST /api/budgets/set              # Create/update budget
POST /api/budgets/get              # Get all budgets
POST /api/budgets/status           # Check status
POST /api/budgets/delete           # Remove budget
```

### Goal Endpoints
```
POST /api/goals/create             # Create goal
POST /api/goals/get                # Get all goals
POST /api/goals/update             # Update progress
POST /api/goals/delete             # Remove goal
```

### Export Endpoints
```
POST /api/export/json              # Download as JSON
POST /api/export/csv               # Download as CSV
POST /api/import/json              # Upload JSON data
POST /api/statistics               # Get analytics
```

### Health Check
```
GET /api/health                    # Server status
```

---

## Data Flow

### Adding a Transaction

```
User Input (Form)
       ↓
[Client-side Validation]
       ↓
POST /api/transactions/create
       ↓
[Server-side Validation]
       ↓
[Calculate month/year]
       ↓
[Generate unique ID]
       ↓
[Save to MongoDB (User.transactions array)]
       ↓
[Return success response]
       ↓
[Update UI]
       ├─ Add to table
       ├─ Update stats
       └─ Refresh chart
```

### Budget Checking Workflow

```
User adds transaction
       ↓
POST /api/budgets/status
       ↓
[Fetch user's budgets]
       ↓
For each budget:
  ├─ Find all transactions with same category
  ├─ Sum amount of expenses
  ├─ Calculate percentUsed = (spent/limit) * 100
  └─ Set status:
      - "ok" if < alert_threshold
      - "alert" if >= alert_threshold && <= 100
      - "exceeded" if > 100
       ↓
[Return status array]
       ↓
[Display with color coding and progress bars]
```

### Export Data Flow

```
User clicks "Export"
       ↓
POST /api/export/json
       ↓
[Fetch user document]
       ↓
[Prepare export object with transactions, budgets, goals]
       ↓
[Set Content-Disposition header (attachment)]
       ↓
[Send JSON response]
       ↓
[Browser triggers download]
       ↓
[User saves as file]
```

---

## Security Architecture

### Authentication (Future)
```
┌──────────────────┐
│  Client Login    │
└─────────┬────────┘
          │
          ↓
┌──────────────────┐
│ POST /auth/login │
└─────────┬────────┘
          │
          ↓
┌────────────────────────────────┐
│ Verify username + password     │
│ Check password hash (bcrypt)   │
└─────────┬──────────────────────┘
          │
          ↓
┌────────────────────────────────┐
│ Generate JWT Token             │
│ Sign with JWT_SECRET           │
└─────────┬──────────────────────┘
          │
          ↓
┌────────────────────────────────┐
│ Return token to client         │
│ Store in localStorage          │
└────────────────────────────────┘

// Subsequent requests
Authorization: Bearer <token>
     ↓
[Verify token with JWT_SECRET]
     ↓
[Extract user ID from payload]
     ↓
[Proceed with request]
```

### Current Security (Temporary User ID)
```
User ID stored in localStorage: '#Username'
All API calls include user ID in request body
Server trusts user ID (temporary - replace with JWT)
```

### Security Best Practices Implemented

```javascript
✅ Helmet.js
   - Sets security HTTP headers
   - Prevents clickjacking, XSS, etc.

✅ CORS Configuration
   - Restricts cross-origin requests
   - Configurable origins

✅ Input Validation
   - Check data types
   - Validate ranges
   - Sanitize strings

✅ MongoDB Injection Prevention
   - Use Mongoose (parameterized queries)
   - Avoid string concatenation

✅ Error Handling
   - Generic error messages to client
   - Detailed logs on server

✅ Environment Variables
   - Sensitive config not in code
   - .env file in .gitignore
```

### To-Do for Production

```
[ ] Implement JWT authentication
[ ] Add rate limiting middleware
[ ] Enable HTTPS only
[ ] Hash passwords with bcrypt
[ ] Add audit logging
[ ] Implement CSRF protection
[ ] Add request size limits
[ ] Enable security headers
[ ] Regular dependency updates
[ ] SQL injection prevention (MongoDB)
[ ] XSS protection
[ ] CORS strict configuration
[ ] API key management
```

---

## Scalability Considerations

### Current Architecture Limitations

```
1. Monolithic application (backend + frontend together)
2. Single MongoDB instance
3. No caching layer
4. No API versioning
5. No message queue for async tasks
```

### Scaling Strategy

#### Horizontal Scaling
```
Load Balancer
    ├─ App Server 1
    ├─ App Server 2
    └─ App Server 3
         ↓
    Shared MongoDB
         ↓
    Redis Cache (session, data)
```

#### Vertical Scaling
```
- Increase server resources
- Optimize code
- Add database indexes
- Implement caching
```

#### Database Scaling
```
MongoDB Replica Set:
├─ Primary (reads + writes)
├─ Secondary (reads)
└─ Secondary (reads)

Sharding (if needed):
├─ Shard 1 (users A-M)
├─ Shard 2 (users N-Z)
└─ Config Servers
```

### Performance Optimization

```
Frontend:
├─ Minify CSS/JS
├─ Compress images
├─ Lazy load charts
├─ Cache API responses
└─ Use CDN for static files

Backend:
├─ Add database indexes
├─ Implement query optimization
├─ Cache frequent queries
├─ Use pagination
├─ Add request logging
└─ Monitor performance

Database:
├─ Regular backups
├─ Index optimization
├─ Query analysis
└─ Connection pooling
```

### Monitoring & Logging

```
Application Monitoring:
├─ Error tracking (Sentry)
├─ Performance monitoring (New Relic)
├─ Log aggregation (ELK Stack)
└─ Uptime monitoring (Pingdom)

Metrics to Track:
├─ Request latency
├─ Database query time
├─ Error rate
├─ Cache hit ratio
├─ User activity
└─ Resource usage
```

---

## Deployment Architecture

### Development Environment
```
Local Machine
├─ Node.js v18+
├─ MongoDB (local or Atlas)
└─ npm packages
```

### Staging Environment
```
VPS/Cloud Server
├─ Node.js runtime
├─ MongoDB Atlas
├─ Environment variables
└─ SSL certificate
```

### Production Environment
```
Docker Container / Cloud Platform
├─ Node.js 18-alpine
├─ MongoDB Atlas cluster
├─ Environment secrets (secrets manager)
├─ HTTPS enforced
├─ Auto-scaling enabled
└─ Backup strategy
```

---

## Summary

The modernized Expense Tracker features:

✅ **Modular Backend** - Organized controllers, routes, models
✅ **Component-Based Frontend** - Manager classes per page
✅ **Database-Driven** - Mongoose schemas for all entities
✅ **Secure** - Helmet.js, CORS, input validation
✅ **Scalable** - Ready for horizontal scaling
✅ **Maintainable** - Clear separation of concerns
✅ **Documented** - Code comments, architecture docs
✅ **Testable** - Structured for unit and integration tests

---

**Architecture Version:** 1.0
**Last Updated:** 2024
**Status:** Production Ready ✅
