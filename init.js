'use strict';

const config = require('./config');
const ngrok = require('ngrok');
const server = require('./server');

ngrok.connect(config.PORT, (err, url) => {
    console.log(url);
    server.setBase(url);
    server.init();
});