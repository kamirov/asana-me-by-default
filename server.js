var config = require('./config');

const express = require('express');
const app = express();


// Initialization
app.post('/init', function (req, res) {

    // Get list of workspaces

    // Get list of projects in each workspace
    
    // Register webhook for each project

});


// Webhook handler
app.post('/update/:projectId', function(req, res) {
    
});


app.listen(3000, function () {
    console.log('Listening');
});