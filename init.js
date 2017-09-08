'use strict';

const config = require('./config');
const ngrok = require('ngrok');
const server = require('./server');

ngrok.connect(config.PORT, (err, url) => {
    if (err) {
        console.error('Couldn\'t establish https tunnel. Is the port ' + config.PORT + ' available?');    
        process.exit();    
    }

    console.log('Established tunnel to localhost:' + config.PORT + ' through URL: ' + url);
    server.setBase(url);
    server.init();
});
