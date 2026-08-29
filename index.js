require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize app
const app = express();
const port = process.env.PORT || 3000;

// Import database connection
const connectDB = require('./config/database');

// Import backward compatibility utilities
const { autoMigrateOnStartup } = require('./utils/backwardCompatibility');

// Import routes
const apiRoutes = require('./routes/api');

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://cdn.tailwindcss.com",
                "https://cdn.plot.ly",
                "https://code.jquery.com",
                "https://www.googletagmanager.com",
                "https://kit.fontawesome.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.tailwindcss.com",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://images.unsplash.com"
            ],
            connectSrc: [
                "'self'",
                "http://localhost:8080",
                "ws:",
                "wss:"
            ],
            fontSrc: [
                "'self'",
                "data:",
                "https://cdnjs.cloudflare.com",
                "https://fonts.gstatic.com",
                "https://kit.fontawesome.com"
            ],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, './Public')));

(async () => {
    try {
        await connectDB();
        await autoMigrateOnStartup();
        console.log('✓ Database initialization complete');
    } catch (error) {
        console.error('✗ Database initialization failed:', error.message);
        process.exit(1);
    }
})();

// API Routes
app.use('/api', apiRoutes);

// Serve insights.html
app.get('/insights', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, './Public/insights.html'));
    } catch (err) {
        console.error('Error serving insights:', err);
        res.status(500).send("Error loading page");
    }
});

app.get('/budgets', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, './Public/budgets.html'));
    } catch (err) {
        console.error('Error serving budgets:', err);
        res.status(500).send("Error loading page");
    }
});

app.get('/goals', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, './Public/goals.html'));
    } catch (err) {
        console.error('Error serving goals:', err);
        res.status(500).send("Error loading page");
    }
});

app.get('/settings', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, './Public/settings.html'));
    } catch (err) {
        console.error('Error serving settings:', err);
        res.status(500).send("Error loading page");
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Main page (catch-all)
app.get('/*', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, './Public/index.html'));
    } catch (err) {
        console.error('Error serving index:', err);
        res.status(500).send("Error loading page");
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
app.listen(port, () => {
    console.log(`✓ Server running on http://localhost:${port}`);
    console.log(`✓ API endpoints available at http://localhost:${port}/api`);
}).on('error', (err) => {
    console.error('✗ Server error:', err.message);
    process.exit(1);
});

module.exports = app;
