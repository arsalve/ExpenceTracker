# 🧪 Testing Guide - खर्चप्रबंधक

## Overview
This guide helps you test all features of the modernized Expense Tracker to ensure everything is working correctly.

---

## ✅ Pre-Test Checklist

- [ ] Node.js is installed
- [ ] MongoDB is running and accessible
- [ ] .env file is configured with correct MONGODB_URI
- [ ] `npm install` has been completed
- [ ] Server started with `npm start`
- [ ] No console errors on startup

---

## 🧪 Test Cases

### 1. Server Startup & Health Check

#### Test 1.1: Server Starts Successfully
```bash
npm start
```

**Expected Result:**
```
Server is running on http://localhost:8080
Connected to MongoDB
Ready to receive requests
```

#### Test 1.2: Health Check Endpoint
```bash
curl http://localhost:8080/api/health
# or in Postman: GET http://localhost:8080/api/health
```

**Expected Result:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Frontend Pages

#### Test 2.1: Main Dashboard
1. Open browser to `http://localhost:8080`
2. Verify:
   - [ ] Page loads without errors (check F12 console)
   - [ ] Navigation menu is visible
   - [ ] Stats cards display (Income, Expense, Savings, Balance)
   - [ ] Transaction form is present
   - [ ] Dark mode toggle works
   - [ ] Mobile menu appears on small screens

#### Test 2.2: All Pages Load
1. Click each navigation link:
   - [ ] Home page (/) - Dashboard
   - [ ] Analytics (/insights) - Charts and statistics
   - [ ] Budgets (/budgets) - Budget management
   - [ ] Goals (/goals) - Goals tracking
   - [ ] Settings (/settings) - User preferences

**Expected:** All pages load without errors, responsive design works

---

### 3. Transaction Management

#### Test 3.1: Add Transaction
1. Go to Dashboard
2. Fill in form:
   - Date: Today
   - Amount: 500
   - Type: Income
   - Category: Salary
   - Description: Test transaction
   - Notes: Testing

3. Click "नोंद करा" (Save)

**Expected Results:**
- [ ] Success message appears
- [ ] Form clears
- [ ] Transaction appears in table below
- [ ] Stats update (Income increases)
- [ ] Category chart updates

#### Test 3.2: Delete Transaction
1. Click "Delete Mode" checkbox
2. Delete button appears in table
3. Click delete on a transaction
4. Confirm deletion

**Expected Results:**
- [ ] Transaction is removed
- [ ] Stats update correctly
- [ ] Chart updates

#### Test 3.3: Search/Filter
1. Go to Dashboard
2. Change month in month selector
3. Transactions update for that month

**Expected Results:**
- [ ] Only transactions from selected month show
- [ ] Stats recalculate for selected month

---

### 4. API Testing (Using Postman or cURL)

#### Test 4.1: Create Transaction
```bash
curl -X POST http://localhost:8080/api/transactions/create \
  -H "Content-Type: application/json" \
  -d '{
    "user": "TestUser",
    "date": "2024-01-15",
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "description": "Monthly salary"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaction created",
  "transaction": {...}
}
```

#### Test 4.2: Get Transactions
```bash
curl -X POST http://localhost:8080/api/transactions/get \
  -H "Content-Type: application/json" \
  -d '{
    "user": "TestUser",
    "month": 1,
    "year": 2024
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "transactions": [...]
}
```

#### Test 4.3: Get Monthly Summary
```bash
curl -X POST http://localhost:8080/api/transactions/summary \
  -H "Content-Type: application/json" \
  -d '{
    "user": "TestUser",
    "month": 1,
    "year": 2024
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "income": 5000,
    "expense": 2000,
    "savings": 1000,
    "categorywise": {...}
  }
}
```

---

### 5. Budget Management

#### Test 5.1: Set Budget
1. Go to Budgets page
2. Fill in:
   - Category: Food
   - Limit: 3000
   - Alert Threshold: 80

3. Click "Set Budget"

**Expected Results:**
- [ ] Success message
- [ ] Budget appears in budget list
- [ ] Progress bar shows

#### Test 5.2: Budget Status
```bash
curl -X POST http://localhost:8080/api/budgets/status \
  -H "Content-Type: application/json" \
  -d '{
    "user": "TestUser",
    "month": 1,
    "year": 2024
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "status": [
    {
      "category": "Food",
      "limit": 3000,
      "spent": 1500,
      "remaining": 1500,
      "percentUsed": 50,
      "status": "ok"
    }
  ]
}
```

#### Test 5.3: Alert Threshold
1. Add transactions exceeding 80% of budget
2. Check budget status

**Expected:**
- [ ] Status changes from "OK" to "Alert" at 80%
- [ ] Status changes to "Exceeded" when limit exceeded
- [ ] Color indicators change (green → yellow → red)

---

### 6. Financial Goals

#### Test 6.1: Create Goal
1. Go to Goals page
2. Fill in:
   - Name: Emergency Fund
   - Target Amount: 50000
   - Target Date: 2024-12-31
   - Priority: High
   - Description: Build emergency fund

3. Click "Create Goal"

**Expected Results:**
- [ ] Success message
- [ ] Goal appears in goals list
- [ ] Progress bar shows 0%

#### Test 6.2: Update Goal Progress
1. Enter amount in "Amount" field
2. Click "Update"

**Expected Results:**
- [ ] Progress increases
- [ ] Percentage updates
- [ ] Remaining amount recalculates

#### Test 6.3: Goal Completion
1. Update goal progress to reach target amount
2. Check status

**Expected:**
- [ ] Progress reaches 100%
- [ ] Goal status changes to "Completed"

---

### 7. Analytics Page

#### Test 7.1: Load Analytics
1. Go to Analytics page
2. Select year (e.g., 2024)
3. Click "Analyze"

**Expected Results:**
- [ ] Statistics cards update
- [ ] Monthly trend chart loads
- [ ] Expense distribution chart loads
- [ ] Category breakdown table shows data

#### Test 7.2: Charts Display
1. Verify charts are interactive (hover, click)
2. Chart titles are visible
3. Axis labels are correct
4. Data points are accurate

**Expected:**
- [ ] Monthly trend shows income (green) and expense (red) lines
- [ ] Expense distribution shows bar chart by month
- [ ] Category breakdown lists all spending categories

#### Test 7.3: Export Statistics
```bash
curl -X POST http://localhost:8080/api/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "user": "TestUser",
    "year": 2024
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "total_income": 100000,
    "total_expense": 50000,
    "total_savings": 30000,
    "net_balance": 20000,
    "monthly_breakdown": {...}
  }
}
```

---

### 8. Settings & Data Management

#### Test 8.1: Theme Toggle
1. Click theme toggle button (moon icon)
2. Page background changes
3. Text color inverts

**Expected:**
- [ ] Dark mode activates/deactivates smoothly
- [ ] Settings persist on refresh

#### Test 8.2: Language Selection
1. Go to Settings
2. Select different language
3. Refresh page

**Expected:**
- [ ] UI text updates to selected language
- [ ] Setting persists

#### Test 8.3: Export Data (JSON)
1. Click "Export as JSON"
2. File downloads

**Verify:**
```bash
# Check downloaded file
cat expense-tracker-*.json | python -m json.tool
```

**Expected:**
- [ ] Valid JSON format
- [ ] Contains transactions, budgets, goals
- [ ] All data is included

#### Test 8.4: Export Data (CSV)
1. Click "Export as CSV"
2. File downloads

**Verify:**
```bash
# Open in spreadsheet application
# Check columns: Date, Amount, Type, Description, Category, Notes
```

**Expected:**
- [ ] Valid CSV format
- [ ] Headers correct
- [ ] Data properly formatted
- [ ] Can open in Excel/Google Sheets

#### Test 8.5: Import Data
1. Export data as JSON (from Test 8.3)
2. Go to Settings
3. Click "Import Data"
4. Select exported JSON file
5. Confirm import

**Expected:**
- [ ] Import summary shows numbers
- [ ] Transactions appear in dashboard
- [ ] Data merges correctly

---

### 9. Mobile Responsiveness

#### Test 9.1: Mobile View
1. Open DevTools (F12)
2. Click device toolbar (mobile view)
3. Select iPhone 12 (390x844)

**Test each page:**
- [ ] Dashboard
- [ ] Analytics
- [ ] Budgets
- [ ] Goals
- [ ] Settings

**Verify:**
- [ ] No horizontal scrolling
- [ ] Text is readable
- [ ] Buttons are clickable
- [ ] Forms are usable
- [ ] Navigation menu collapses

#### Test 9.2: Tablet View
1. Select iPad (1024x1366) in device toolbar

**Verify:**
- [ ] Layout is optimized for tablet
- [ ] Two-column layout appears if applicable
- [ ] All features accessible

#### Test 9.3: Desktop View
1. Maximize browser window

**Verify:**
- [ ] Full layout displays correctly
- [ ] All columns visible
- [ ] Charts display properly

---

### 10. Browser Compatibility

#### Test 10.1: Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Charts display correctly

#### Test 10.2: Firefox
- [ ] All features work
- [ ] Dark mode works
- [ ] Downloads function properly

#### Test 10.3: Safari
- [ ] Page loads
- [ ] Forms are functional
- [ ] Charts display

---

### 11. Data Validation

#### Test 11.1: Empty Fields
1. Try to submit transaction form without:
   - [ ] Amount
   - [ ] Type
   - [ ] Category

**Expected:** Error message or field highlight

#### Test 11.2: Invalid Data
1. Try to enter:
   - [ ] Negative amount
   - [ ] Non-numeric amount
   - [ ] Invalid date

**Expected:** Input restriction or validation error

#### Test 11.3: Special Characters
1. Add transaction with description containing:
   - [ ] Special characters (!, @, #)
   - [ ] Emojis 😊
   - [ ] Marathi/Hindi text

**Expected:** Data saves correctly and displays properly

---

### 12. Performance Testing

#### Test 12.1: Page Load Time
1. Open DevTools (F12)
2. Go to Network tab
3. Load each page

**Check:**
- [ ] Initial load < 3 seconds
- [ ] Page interactive < 2 seconds
- [ ] Bundle size < 500KB

#### Test 12.2: Large Dataset
1. Add 100+ transactions
2. Go to Analytics page
3. Load data

**Expected:**
- [ ] Page still responsive
- [ ] Charts load within 3 seconds
- [ ] No UI freezing

#### Test 12.3: Concurrent Requests
1. Open multiple pages in tabs
2. Load data simultaneously

**Expected:**
- [ ] No errors
- [ ] All data loads correctly
- [ ] No data corruption

---

### 13. Database Testing

#### Test 13.1: Data Persistence
1. Add transaction
2. Refresh page
3. Transaction still visible

**Expected:** Data persists in database

#### Test 13.2: Database Backup
1. Export data as JSON
2. Stop server
3. Delete MongoDB database
4. Restart server
5. Import JSON

**Expected:**
- [ ] All data restored
- [ ] No data loss
- [ ] Relationships maintained

---

## 🐛 Bug Report Template

If you find any issues, use this template:

```
## Bug Title
Brief description of the issue

## Reproduction Steps
1. Step 1
2. Step 2
3. Step 3

## Expected Result
What should happen

## Actual Result
What actually happens

## Screenshots/Videos
Attach if applicable

## Environment
- Browser: Chrome 121
- OS: Windows 10
- Node Version: 18.14.0
- MongoDB: Local/Atlas

## Console Error
[Paste any error messages from browser console]
```

---

## ✨ Test Results Summary

After completing all tests, fill in:

| Test Area | Status | Notes |
|-----------|--------|-------|
| Server Startup | ✅/❌ | |
| Frontend Pages | ✅/❌ | |
| Transactions | ✅/❌ | |
| API Endpoints | ✅/❌ | |
| Budgets | ✅/❌ | |
| Goals | ✅/❌ | |
| Analytics | ✅/❌ | |
| Settings | ✅/❌ | |
| Mobile View | ✅/❌ | |
| Browser Compatibility | ✅/❌ | |
| Data Validation | ✅/❌ | |
| Performance | ✅/❌ | |
| Database | ✅/❌ | |

---

## 🎉 All Tests Passed!

If all tests pass, your application is ready to use! 🚀

For any issues, check:
1. Browser console (F12)
2. Server logs
3. MongoDB connection
4. .env configuration

---

**Testing Guide Version:** 1.0
**Last Updated:** 2024
**Status:** Ready for testing ✅
