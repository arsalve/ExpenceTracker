const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const port = process.env.PORT || 8080;
const catchHandler = require('./utils/catchHandler.js');
const DataManupulation = require('./controllers/DataManupulation.js');
const Downloads = require('./controllers/Downloads.js');
const Model = require('./models/Models.js');

const {
    exception
} = require('console');
let fs = require('fs');
const {
    format
} = require('path');

app.use('/static', express.static('./static'));
try {

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cors());
    app.use(express.static(path.join(__dirname, './Public')));
    app.use(bodyParser.json({
        limit: '50mb'
    }))
    //defining port to listen
    app.listen(port, () => {
        catchHandler('Ignition', 'ready for targates', "sucess");
    }).on('error', (err) => {
        catchHandler('Server Listen', err, "Error");
        process.exit(1);
    });
    //Following Endpoint Updates an object in Mongo db or if the object is not present it will create new  
    app.post('/Insert', (req, res) => {
        try {
            let Responce = DataManupulation.Insert(req, (responce) => {
                res.send(responce);
            });
        } catch (err) {
            catchHandler('/Insert', err, "Error");
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    app.post('/Delete', (req, res) => {
        try {
            let Responce = DataManupulation.delEntry(req, (responce) => {
                res.send(responce);
            });
        } catch (err) {
            catchHandler('/Delete', err, "Error");
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    //Following Endpoint finds an object from Mongo db 
    app.post('/find', (req, res) => {
        try {
            var responce = DataManupulation.FindObj(req, (responce) => {
                res.send(responce);
            });
        } catch (err) {
            catchHandler('/find', err, "Error");
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Serve insights.html
    app.get('/insights', (req, res) => {
        try {
            res.sendFile(path.join(__dirname, './Public/insights.html'));
        } catch (err) {
            catchHandler('/insights', err, "Error");
            res.status(500).send("Issue with server");
        }
    });
    app.get('/find', (req, res) => {
        try {
            req.manuser = '#' + req.query.user;
            var responce = DataManupulation.FindObj(req, (responce) => {
                res.send(responce);
            });
        } catch (err) {
            catchHandler('/find (GET)', err, "Error");
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    //Following Endpoint sends an entry page for user
    app.get('/*', (req, res) => {
        try {
            fs.readFile(path.join(__dirname, 'Public', 'index.html'), 'utf8', function (err, text) {
                if (err) {
                    catchHandler("Read index.html", err, "Error");
                    res.status(500).send("Issue with server");
                } else {
                    res.send(text);
                }
            });
        } catch (error) {
            catchHandler("Error Occured while  provideing service", error, "Error");
            res.status(500).send("Issue with server");
            return error;
        }
    })
    // Add these routes before the catch-all route
    app.post('/fixed/add', async (req, res) => {
        try {
            const { user, type, description, amount } = req.body;
            const entry = new Model.FixedEntry({ user, type, description, amount });
            await entry.save();
            res.json({ success: true });
        } catch (err) {
            catchHandler('/fixed/add', err, "Error");
            res.status(500).json({ error: 'Failed to save fixed entry' });
        }
    });

    app.post('/fixed/list', async (req, res) => {
        try {
            const { user } = req.body;
            const entries = await Model.FixedEntry.find({ user });
            res.json(entries);
        } catch (err) {
            catchHandler('/fixed/list', err, "Error");
            res.status(500).json({ error: 'Failed to fetch fixed entries' });
        }
    });

} catch (error) {
    catchHandler('Start', error, "Error")
}