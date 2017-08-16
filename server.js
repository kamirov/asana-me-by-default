const request = require('request');
const express = require('express');
const config = require('./config');
const app = express();


// Initialization
app.post('/init', (req, res) => {

    // Get list of workspaces

    // Get list of projects in each workspace
    
    // Register webhook for each project

});


// Webhook handler
app.post('/update/:projectId', (req, res) => {
    
});


app.listen(3000, () => console.log('Listening') );