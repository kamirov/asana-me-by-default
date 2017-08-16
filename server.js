'use strict';

const request = require('request');
const rp = require('request-promise')
const express = require('express');
const config = require('./config');
const app = express();

let requestOptions = {
    headers: {
        'Authorization': 'Bearer ' + config.PERSONAL_ACCESS_TOKEN
    }, 
    json: true     
};

const asanaApiUrl = 'https://app.asana.com/api/1.0';
let urls = {
    allWorkSpaces: asanaApiUrl + '/workspaces'
};

// Initialization
app.post('/init', (req, res) => {

    // Get list of workspaces
    rp.get(urls.allWorkSpaces, requestOptions)
        .then((response) => response.data)
        .then((workspaces) => {
            
        });

    // Get list of projects in each workspace
    
    // Register webhook for each project

});


// Webhook handler
app.post('/update/:projectId', (req, res) => {
    
});


app.listen(3000, () => console.log('Listening') );