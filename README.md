# खर्चप्रबंधक - Modern Personal Finance Tracker

A modern, fully-featured personal finance tracker built with Node.js, Express, MongoDB, and a responsive Tailwind CSS frontend.

## 🌟 Features

### Core Features
- **Transaction Management** - Track income, expenses, and savings with detailed categories
- **Monthly Dashboard** - View quick stats for income, expenses, savings, and net balance
- **Transaction Filtering** - Search and filter by month, category, or type
- **Category Breakdown** - Visual pie charts showing expense distribution
- **Delete Mode** - Safely delete transactions with confirmation

### 📊 Advanced Analytics (New!)
- **Monthly Trends** - View income and expense trends across months
- **Category Analysis** - Detailed breakdown of spending by category
- **Annual Statistics** - Comprehensive financial overview
- **Multiple Charts** - Interactive Plotly charts for data visualization
- **Export Data** - Export statistics as JSON for further analysis

### 💰 Budget Management (New!)
- **Set Category Budgets** - Define monthly spending limits per category
- **Budget Status Tracking** - Monitor spent vs. budget limit
- **Alert Thresholds** - Get alerts when spending reaches 80% of budget (configurable)
- **Exceed Warnings** - Visual indicators for over-budget categories
- **Progress Bars** - Clear visualization of budget utilization

### 🎯 Financial Goals (New!)
- **Goal Setting** - Create financial targets with amounts and due dates
- **Priority Levels** - Categorize goals as low, medium, or high priority
- **Progress Tracking** - Update progress and track goal completion
- **Target Management** - Monitor how close you are to each goal
- **Goal Status** - Track active, completed, or abandoned goals

### ⚙️ Settings & Data Management (New!)
- **Theme Toggle** - Dark/Light mode support
- **Language Support** - Marathi, English, and Hindi interfaces
- **Currency Selection** - Choose your preferred currency
- **Data Export** - Export all data as JSON or CSV
- **Data Import** - Import previously exported data
- **Safe Data Clearing** - Clear all data with confirmation

### 🎨 Modern UI/UX
- **Tailwind CSS** - Modern, responsive design framework
- **Mobile First** - Fully responsive on all devices
- **Dark Mode** - Eye-friendly dark theme
- **Font Awesome Icons** - Beautiful icon set
- **Smooth Animations** - Fluid transitions and effects
- **Accessibility** - WCAG compliant design

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ExpenceTracker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env File**
   ```
   NODE_ENV=development
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/expensetracker
   JWT_SECRET=your_secret_key_here
   ```

5. **Start the Server**
   ```bash
   npm start
   ```

6. **Open in Browser**
   ```
   http://localhost:8080
   ```

## 📁 Project Structure

```
ExpenceTracker/
├── config/
│   ├── database.js          # MongoDB connection
│   └── constants.js         # App constants & categories
├── controllers/
│   ├── transactionController.js    # Transaction CRUD & analytics
│   ├── planningController.js       # Budgets & Goals
│   └── exportController.js         # Export/Import & statistics
├── models/
│   └── schemas.js           # Mongoose schemas
├── routes/
│   └── api.js               # API routes
├── Public/
│   ├── index.html           # Dashboard page
│   ├── insights.html        # Analytics page
│   ├── budgets.html         # Budget management page
│   ├── goals.html           # Goals tracking page
│   ├── settings.html        # Settings page
│   ├── app.js               # Main frontend logic
│   ├── insights.js          # Analytics handlers
│   ├── budgets.js           # Budget handlers
│   ├── goals.js             # Goals handlers
│   ├── settings.js          # Settings handlers
│   └── styles.css           # Modern CSS styling
├── index.js                 # Main server file
├── package.json             # Dependencies
└── README.md               # This file
```

## 🔌 API Endpoints

### Transactions
- `POST /api/transactions/create` - Create transaction
- `POST /api/transactions/get` - Get transactions
- `POST /api/transactions/delete` - Delete transaction
- `POST /api/transactions/update` - Update transaction
- `POST /api/transactions/summary` - Monthly summary
- `POST /api/transactions/breakdown` - Category breakdown

### Budgets
- `POST /api/budgets/set` - Set budget
- `POST /api/budgets/get` - Get budgets
- `POST /api/budgets/status` - Check budget status
- `POST /api/budgets/delete` - Delete budget

### Goals
- `POST /api/goals/create` - Create goal
- `POST /api/goals/get` - Get goals
- `POST /api/goals/update` - Update goal progress
- `POST /api/goals/delete` - Delete goal

### Data Management
- `POST /api/export/json` - Export as JSON
- `POST /api/export/csv` - Export as CSV
- `POST /api/import/json` - Import JSON data
- `POST /api/statistics` - Get statistics

## 📱 Pages Overview

### Dashboard (/)
Main landing page with:
- Quick financial statistics
- Transaction form
- Month selector
- Category breakdown chart
- Transactions table
- Delete mode toggle

### Analytics (/insights)
Detailed financial analysis:
- Year selector
- Annual statistics
- Monthly trend chart
- Expense distribution chart
- Category-wise breakdown table
- Data export functionality

### Budgets (/budgets)
Budget management interface:
- Add new budgets by category
- View budget status
- Track spending vs. limits
- Alert thresholds
- Progress visualization
- Delete budgets

### Goals (/goals)
Financial goals tracking:
- Create new financial targets
- Set priorities (low/medium/high)
- Track progress
- Update goal amounts
- View target dates
- Manage multiple goals

### Settings (/settings)
Configuration & data management:
- User information
- Currency selection
- Language preferences
- Data export (JSON/CSV)
- Data import
- Clear all data (with confirmation)

## 🛠️ Technologies Used

### Backend
- **Express.js** - Web framework
- **Mongoose** - MongoDB object modeling
- **Node.js** - Runtime environment
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Body-parser** - Request parsing

### Frontend
- **Tailwind CSS** - Utility-first CSS framework
- **Plotly.js** - Interactive charts
- **jQuery** - DOM manipulation
- **Font Awesome** - Icons
- **Vanilla JavaScript** - Core logic

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - Schema validation

## 💡 Usage Tips

### Adding a Transaction
1. Fill in the date, amount, type, category, and description
2. Optionally add notes
3. Click "नोंद करा" (Save) button
4. Transaction appears in the table below

### Setting a Budget
1. Go to Budgets page
2. Select category and set limit
3. Adjust alert threshold if needed
4. Click "Set Budget"
5. Monitor progress with visual indicators

### Creating a Goal
1. Navigate to Goals page
2. Enter goal name, amount, and target date
3. Set priority level
4. Click "Create Goal"
5. Update progress anytime

### Exporting Data
1. Go to Settings page
2. Click "Export as JSON" or "Export as CSV"
3. File automatically downloads
4. Use for backup or analysis

## 🌍 Localization

Supports multiple languages:
- **Marathi** (मराठी) - Default
- **English** - Full interface translation
- **Hindi** (हिन्दी) - Partial support

Change language in Settings page.

## 🔒 Security

- Input validation on all endpoints
- Helmet.js for HTTP headers security
- CORS protection
- MongoDB injection prevention via Mongoose
- Secure error handling

## 📊 Data Structure

### Transaction Schema
```javascript
{
  date: Date,
  month: Number,
  year: Number,
  amount: Number,
  type: String (income|expense|savings),
  description: String,
  category: String,
  notes: String,
  tags: [String],
  isRecurring: Boolean,
  id: String
}
```

### Budget Schema
```javascript
{
  user: String,
  category: String,
  limit: Number,
  month: Number,
  year: Number,
  alert_threshold: Number (default: 80),
  created_at: Date
}
```

### Goal Schema
```javascript
{
  user: String,
  name: String,
  target_amount: Number,
  current_amount: Number,
  target_date: Date,
  priority: String (low|medium|high),
  description: String,
  status: String (active|completed|abandoned),
  created_at: Date
}
```

## 🔄 Backwards Compatibility

Old endpoints are still supported:
- `POST /Insert` → `POST /api/transactions/create`
- `POST /Delete` → `POST /api/transactions/delete`
- `POST /find` → `POST /api/transactions/get`

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify database permissions

### API Not Responding
- Check server logs for errors
- Verify all environment variables
- Restart the application

### Data Not Loading
- Clear browser cache
- Check user ID in localStorage
- Verify MongoDB contains data

## 📈 Future Enhancements

- [ ] Recurring transactions automation
- [ ] Multi-user support with authentication
- [ ] Mobile app (React Native)
- [ ] Bill reminders
- [ ] Receipt image upload
- [ ] Multi-currency support
- [ ] Tax calculation tools
- [ ] Investment tracking
- [ ] Debt management
- [ ] PWA support

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details.

## 👨‍💼 Author

**Ashish Salve**

## 🙏 Acknowledgments

- Bootstrap Community
- Tailwind CSS
- Plotly.js
- Font Awesome
- MongoDB
- Node.js Community

## 📞 Support

For issues, suggestions, or feature requests:
1. Check existing issues
2. Create a new issue with detailed description
3. Include screenshots if applicable
4. Provide error logs if relevant

---

**Built with ❤️ for personal finance management**

*Last Updated: 2024*
*Version: 1.0.0*

