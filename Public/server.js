require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const connectDB = require('./config/database');
const { autoMigrateOnStartup } = require('./utils/backwardCompatibility');
const apiRoutes = require('./routes/api');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://cdn.plot.ly",
                "https://cdn.jsdelivr.net",
                "https://code.jquery.com",
                "https://www.googletagmanager.com",
                "https://kit.fontawesome.com",
                "https://cdnjs.cloudflare.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com"
            ],
            imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com"],
            connectSrc: [
                "'self'",
                "http:",
                "https:",
                "ws:",
                "wss:"
            ],
            fontSrc: [
                "'self'",
                "data:",
                "https://fonts.gstatic.com",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com",
                "https://kit.fontawesome.com"
            ],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"]
        }
    }
}));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
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

app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        message: 'Server is running'
    });
});

app.get('/insights', (req, res) => {
    res.sendFile(path.join(__dirname, './Public/insights.html'));
});

app.get('/budgets', (req, res) => {
    res.sendFile(path.join(__dirname, './Public/budgets.html'));
});

app.get('/goals', (req, res) => {
    res.sendFile(path.join(__dirname, './Public/goals.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, './Public/settings.html'));
});

app.get('/*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }

    res.sendFile(path.join(__dirname, './Public/index.html'), err => {
        if (err) next(err);
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (res.headersSent) return next(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

app.listen(port, () => {
    console.log(`✓ Server running on http://localhost:${port}`);
    console.log(`✓ API endpoints available at http://localhost:${port}/api`);
}).on('error', err => {
    console.error('✗ Server error:', err.message);
    process.exit(1);
});

module.exports = app;
