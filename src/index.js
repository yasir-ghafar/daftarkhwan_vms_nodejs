require("dotenv").config(); //to make sure it gets the .env file


const express = require('express');
const cors = require('cors');
const path = require('path');
const timeout = require('connect-timeout');
const { ServerConfig } = require('./config');
const  apiRoutes = require('./routes');
const { StatusCodes } = require('http-status-codes');

const app = express()
const PORT = ServerConfig.PORT;
const REQUEST_TIMEOUT = 10000; // 10 seconds


app.use(cors());
app.use(express.json());
app.use(timeout(`${REQUEST_TIMEOUT}ms`)); // <-- set request timeout globally


app.use((req, res, next) => {
    if (!req.timedout) next();
});

//app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes)

app.use((err, req, res, next) => {
    if (err.timeout) {
        console.error('Request timed out');
        if (!res.headersSent) {
        res.status(StatusCodes.SERVICE_UNAVAILABLE).json({error: 'Request timed out'});
        }
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Successfully started the server on PORT: ${PORT}`);
});
