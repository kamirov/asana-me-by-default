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
    allWorkSpaces: asanaApiUrl + '/workspaces',
    allProjects: asanaApiUrl + '/projects',
    receiveWebhook: asanaApiUrl + '/webhooks',
    getAllWebhooks: asanaApiUrl + '/webhooks'
};

// Initialization
app.get('/', (req, res) => {
    res.send('Here');
    console.log('request');    
})
app.post('/init', (req, res) => {

    // Get list of workspaces
    rp.get(urls.allWorkSpaces, requestOptions)
        .then((response) => response.data)
        .then((workspaces) => {

            console.log(workspaces);
            let resourceId = 402262906871702;
            let webhookRequestOptions = Object.assign(requestOptions, {
                body: {
                    data: {
                        resource: resourceId,
                        target: config.BASE + '/update/' + resourceId                        
                    }
                }
            });

            // Register webhook for each project
            // console.log(urls.receiveWebhook, webhookRequestOptions);
            rp.post(urls.receiveWebhook, webhookRequestOptions);

            // // Get list of projects in each workspace
            // workspaces.forEach((workspace) => {
            //     let allProjectsRequestOptions = Object.assign(requestOptions, {
            //         qs: {
            //             workspace: workspace.id
            //         }
            //     });

            //     // rp.get(urls.allProjects, allProjectsRequestOptions)
            //     //     .then((projects) => {
            //     //         // console.log(projects);
            //     //         // res.send(projects);

            //     //         // projects.forEach((project) => {
            //     //         //     let webhookRequestOptions = Object.assign(requestOptions, {
            //     //         //         qs: {
            //     //         //             resource: project.id
            //     //         //         },
            //     //         //         target: config.BASE + '/update/' + project.id
            //     //         //     });

            //     //         //     // Register webhook for each project
            //     //         //     // rp.post(urls.receiveWebhook, webhookRequestOptions)
            //     //         //     //     .then(() => {
                                    
            //     //         //     //     });
            //     //         // });
                        
            //     //     })
            // });

            // res.json(workspaces);            
        });
        
    // res.send(res)
});


// Webhook handler 
app.post('/update/:projectId', (req, res) => {
    console.log('body', req.body);

    let xHookSecret = req.get('X-Hook-Secret');
    res.set({
        'X-Hook-Secret': xHookSecret
    });

    console.log('xHook', xHookSecret);

    res.send();
});


// GET all webhooks
app.get('/webhooks', (req, res) => {
    console.log(req.params);

    // Get all workspaces
    rp.get(urls.allWorkSpaces, requestOptions)
        .then((response) => response.data)
        .then((workspaces) => {
        console.log(workspaces);

        // Get all webhooks in each workspace
            workspaces.forEach((workspace) => {
                let webhookRequestOptions = Object.assign(requestOptions, {
                    qs: {
                        workspace: workspace.id,
                    }
                });

                rp.get(urls.getAllWebhooks, webhookRequestOptions)
                    .then((response) => {
                        console.log(workspace.name, response.data);
                    });
            });
        });
});


app.listen(config.PORT, () => console.log('Listening') );