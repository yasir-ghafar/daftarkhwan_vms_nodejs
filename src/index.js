const express = require('express');
const cors = require('cors');
const path = require('path');
const { ServerConfig } = require('./config');
const  apiRoutes = require('./routes');

const app = express()
app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes)

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT: ${ServerConfig.PORT}`);
});
