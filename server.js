'use strict';

const request = require('request');
const rp = require('request-promise')
const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser')
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
    getWorkspaceWebhooks: asanaApiUrl + '/webhooks',
    deleteWebhook: asanaApiUrl + '/webhooks/:webhookId',
    updateTask: asanaApiUrl + '/tasks/:taskId'
};


// Middleware
app.use( bodyParser.json() );

app.get('/', (req, res) => {
    res.send('Here');
    console.log('request');    
})

// Initialization
app.post('/init', (req, res) => {
    
    // Get list of workspaces
    rp.get(urls.allWorkSpaces, requestOptions)
        .then((response) => response.data)
        .then((workspaces) => {

            // console.log(workspaces);
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
        
    res.send();
});


// Webhook handler 
app.post('/update/:projectId', (req, res) => {    
    // console.log(req.body);

    // TODO: Cache and check this
    let xHookSecret = req.get('X-Hook-Secret');
    
    if (xHookSecret) {
        res.set({
            'X-Hook-Secret': xHookSecret
        });
        console.log('xHook', xHookSecret);
    }

    if (req.body && req.body.events) {
        let addTaskEvents = req.body.events.filter((event) => {
            return event.type === 'task' && event.action == 'added'
        });

        if (addTaskEvents) {
            console.log(addTaskEvents);
            addTaskEvents.forEach((addTaskEvent) => {
                let updateTaskUrl = urls.updateTask
                    .replace(':taskId', addTaskEvent.resource);
                    
                let updateTaskRequestOptions = Object.assign(requestOptions, {
                    body: {
                        data: {
                            assignee: 'me'                        
                        }
                    }
                });

                console.log(updateTaskUrl, updateTaskRequestOptions)
    
                rp.put(updateTaskUrl, updateTaskRequestOptions);
            });
        }
    }

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

                rp.get(urls.getWorkspaceWebhooks, webhookRequestOptions)
                    .then((response) => {
                        console.log(workspace.name, response.data);
                    });
            });
        });
        
    res.send();
});

// DELETE all webhooks
app.delete('/webhooks', (req, res) => {
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
    
                    rp.get(urls.getWorkspaceWebhooks, webhookRequestOptions)
                        .then((response) => response.data)
                        .then((webhooks) => {
                            console.log(workspace.name, webhooks.data);

                            // Delete each webhook
                            webhooks.forEach((webhook) => {
                                let deleteWebhookUrl = urls.deleteWebhook
                                    .replace(':webhookId', webhook.id)

                                rp.delete(deleteWebhookUrl, requestOptions);
                            });
                        });
                });
            });

    res.send();
});

app.listen(config.PORT, () => console.log('Listening') );