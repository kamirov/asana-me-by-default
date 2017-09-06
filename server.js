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
app.listen(config.PORT, () => console.log('Listening') );


// ===========
// Controllers
// ===========

// Initialization
app.post('/init', (req, res) => {
    rp.get(urls.allWorkSpaces, requestOptions)
        .then((response) => response.data)
        .then((workspaces) => {
            workspaces.forEach((workspace) => {
                getWorkspaceProjects(workspace)
                    .then(getResponseData)
                    .then((projects) => projects.forEach((project) => initProjectWebhook(project)));
            });
        });
        
    res.send();
});


// Webhook handler
app.post('/update/:projectId', (req, res) => {    
    performHandshake(req, res);
    
    if (req.body && req.body.events) {
        let addTaskEvents = req.body.events.filter((event) => {
            return event.type === 'task' && event.action == 'added'
        });

        if (addTaskEvents.length) {
            addTaskEvents.forEach((addTaskEvent) => assignTaskToMe(addTaskEvent.resource));
        }
    }

    res.send();
});


// GET all webhooks
app.get('/webhooks', (req, res) => {
    rp.get(urls.allWorkSpaces, requestOptions)
        .then(getResponseData)
        .then((workspaces) => workspaces.forEach((workspace) => getWorkspaceWebhooks(workspace)));
        
    res.send();
});


// DELETE all webhooks
app.delete('/webhooks', (req, res) => {    
    rp.get(urls.allWorkSpaces, requestOptions)
        .then(getResponseData)
        .then((workspaces) => workspaces.forEach((workspace) => deleteWorkspaceWebhooks(workspace)));
    res.send();
});


// =======
// Helpers
// =======

function getResponseData(response) {
    return response.data;
}


function performHandshake(req, res) {
    let xHookSecret = req.get('X-Hook-Secret');
    if (xHookSecret) {
        console.log('Shaking hands');
        res.set({
            'X-Hook-Secret': xHookSecret
        });
    }
}


function initProjectWebhook(project) {
    console.log('Initiating webhook for project ' + project.name);    
    let webhookRequestOptions = Object.assign({}, requestOptions, {
        body: {
            data: {
                resource: project.id,
                target: config.BASE + '/update/' + project.id                        
            }
        }
    });

    rp.post(urls.receiveWebhook, webhookRequestOptions);
}


function getWorkspaceProjects(workspace) {
    let allProjectsRequestOptions = Object.assign({}, requestOptions, {
        qs: {
            workspace: workspace.id
        }
    });

    return rp.get(urls.allProjects, allProjectsRequestOptions)
}


function getWorkspaceWebhooks(workspace) {
    let webhookRequestOptions = Object.assign({}, requestOptions, {
        qs: {
            workspace: workspace.id,
        }
    });

    return rp.get(urls.getWorkspaceWebhooks, webhookRequestOptions)
        .then((response) => {
            console.log(workspace.name, response.data);
        });
}


function deleteWorkspaceWebhooks(workspace) {
    console.log('Deleting webhooks from workspace ' + workspace.name);
    let webhookRequestOptions = Object.assign({}, requestOptions, {
        qs: {
            workspace: workspace.id,
        }
    });

    return rp.get(urls.getWorkspaceWebhooks, webhookRequestOptions)
        .then((response) => response.data)
        .then((webhooks) => deleteWebhooks(webhooks));
}


function deleteWebhooks(webhooks) {
    webhooks.forEach((webhook) => {
        let deleteWebhookUrl = urls.deleteWebhook
            .replace(':webhookId', webhook.id)

        rp.delete(deleteWebhookUrl, requestOptions);
    });
}


function assignTaskToMe(taskId) {
    console.log('Self-assigning task with ID: ' + taskId);

    let updateTaskUrl = urls.updateTask
        .replace(':taskId', taskId);
    
    let updateTaskRequestOptions = Object.assign({}, requestOptions, {
        body: {
            data: {
                assignee: 'me'                        
            }
        }
    });

    return rp.put(updateTaskUrl, updateTaskRequestOptions);
}
