const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const port = process.env.PORT||8080;
const catchHandler = require('./CustomPackages/catchHandler.js');
const DataManupulation = require('./CustomPackages/DataManupulation.js');
const Downloads = require('./CustomPackages/Downloads.js');

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
    });
    //Following Endpoint Updates an object in Mongo db or if the object is not present it will create new  
    app.post('/Insert', (req, res) => {

        let Responce = DataManupulation.Insert(req, (responce) => {
            res.send(responce);
        });
    });
    app.post('/Delete', (req, res) => {

        let Responce = DataManupulation.delEntry(req, (responce) => {
            res.send(responce);
        });
    });
    //Following Endpoint finds an object from Mongo db 
    app.post('/find', (req, res) => {
        var responce = DataManupulation.FindObj(req, (responce) => {
            res.send(responce);
        });

    }); 
    app.get('/find', (req, res) => {
        req.manuser='#'+req.query.user;
        var responce = DataManupulation.FindObj(req, (responce) => {
            res.send(responce);
        });

    });
    //Following Endpoint sends an entry page for user
    app.get('/*', (req, res) => {
        try {
            fs.readFile(__dirname + '\\index.html', 'utf8', function (err, text) {
                res.send(text);
            });
        } catch (error) {
            catchHandler("Error Occured while  provideing service", error, ErrorC);
            res.status(500).send("Issue with server");
            return err;
        }
    })

} catch (error) {
    catchHandler('Start', error, "ErrorC")

}