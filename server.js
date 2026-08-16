require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');

const connectDB = require('./config/database');
const { autoMigrateOnStartup } = require('./utils/backwardCompatibility');
const apiRoutes = require('./routes/api');

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'Public');

app.disable('x-powered-by');

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
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.tailwindcss.com",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com"
            ],
            imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com"],
            connectSrc: ["'self'", "http:", "https:", "ws:", "wss:"],
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
            frameAncestors: ["'none'"]
        }
    }
}));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.static(publicDir));

app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        message: 'Server is running',
        time: new Date().toISOString()
    });
});

const pages = {
    '/insights': 'insights.html',
    '/budgets': 'budgets.html',
    '/goals': 'goals.html',
    '/settings': 'settings.html'
};

for (const [route, file] of Object.entries(pages)) {
    app.get(route, (req, res, next) => {
        res.sendFile(path.join(publicDir, file), err => {
            if (err) next(err);
        });
    });
}

/*
 * Only send index.html for browser page requests.
 * API routes are already handled above.
 */
app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }

    res.sendFile(path.join(publicDir, 'index.html'), err => {
        if (err) next(err);
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

async function startServer() {
    try {
        await connectDB();
        await autoMigrateOnStartup();

        console.log('✓ Database initialization complete');

        app.listen(port, () => {
            console.log(`✓ Server running on http://localhost:${port}`);
            console.log(`✓ API endpoints available at http://localhost:${port}/api`);
            console.log(`✓ Insights page: http://localhost:${port}/insights`);
        });
    } catch (error) {
        console.error('✗ Database initialization failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;
