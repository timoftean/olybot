'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library
const express = require('express');
const request = require('request');
const cors = require('cors')({origin: true});
const cookieParser = require('cookie-parser')();
const server = express();
const gitlab_access_token = require('./config.json').gitlab_access_token
const slack_access_token = require('./config.json').slack_access_token

const dialogflowFirebaseFulfillment = (request, response) => {
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  processV1Request(request, response);
}
/*
* Function to handle v1 webhook requests from Dialogflow
*/
function processV1Request (request, response) {
  let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
  let parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
  let inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts
  let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
  console.log("===== \n", action,  parameters, inputContexts, requestSource)
  
  const actionHandlers = {
    'input.tasks': () => {
      tasksResponse(response)
    },
    'input.welcome': () => {
      console.log("=============")
      let responseJson = {
        'slack': {
          'text': 'Raspuns pentru gabriela.',
          'attachments': [
            {
              'title': 'Title: this is a title',
              'title_link': 'https://assistant.google.com/',
              'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
            },
            {
              'title': 'Title: this is a title',
              'title_link': 'https://assistant.google.com/',
              'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
              // 'image_url': 'https://scontent.fomr1-1.fna.fbcdn.net/v/t31.0-8/24879675_1561203907288620_7306183523469455563_o.jpg?oh=fa022a91645d1243408134194a663a97&oe=5AB98481',
              // 'fallback': 'This is a fallback.'
            }
          ]
        }
      }
      sendResponse(response, 'Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
      // sendRichResponse(response, responseJson)
    },
    'input.unknown': () => {
      sendResponse(response, 'I\'m having trouble, can you try that again?'); // Send simple response to user
    },
    'default': () => {
      let responseToUser = {
        speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
        text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
      };
      sendResponse(response, responseToUser);
    }
  };
  if (!actionHandlers[action]) {
    action = 'default';
  }
  
  // Run the proper handler function to handle the request from Dialogflow
  actionHandlers[action]();
}

function sendRichResponse(response, responseJson) {
  console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
  const res = { data: responseJson }
  response.json(res);
}

// Function to send correctly formatted responses to Dialogflow which are then sent to the user
function sendResponse (response, responseToUser) {
  // if the response is a string send it as a response to the user
  if (typeof responseToUser === 'string') {
    let responseJson = {};
    responseJson.speech = responseToUser; // spoken response
    responseJson.displayText = responseToUser; // displayed response
    response.json(responseJson); // Send response to Dialogflow
  } else {
    // If the response to the user includes rich responses or contexts send them to Dialogflow
    let responseJson = {};
    // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
    responseJson.speech = responseToUser.speech || responseToUser.displayText;
    responseJson.displayText = responseToUser.displayText || responseToUser.speech;
    // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
    responseJson.data = responseToUser.data;
    // Optional: add contexts (https://dialogflow.com/docs/contexts)
    responseJson.contextOut = responseToUser.outputContexts;
    console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
    response.json(responseJson); // Send response to Dialogflow
  }
}

function tasksResponse(response) {
  const url = `https://gitlab.com/api/v4/projects/4372969/issues?private_token=${gitlab_access_token}`
  request.get(url, (err, status, body) => {
    if (err) console.log("err", err)
    let attachments = []
    let res = {
      'data': {
        'slack': {
          'text': 'Here are all issues.',
        }
      }
    }
    body = JSON.parse(body)
    body.map((task) => {
      let fields = task.labels.map(label => {
        return {
          "title": "Label",
          "value": label,
          "short": true
        }
      })
      fields.push({
        "title": "State",
        "value": task.state,
        "short": true
      })
      attachments.push({
        color: "#36a64f",
        title: task.title,
        title_link: task.web_url,
        text: task.description ? task.description.substr(0, 50) + "..." : "",
        author_name: task.assignee? task.assignee.name : "",
        author_link: task.assignee? task.assignee.web_url : "",
        ts: new Date(task.createdAt).getTime(),
        fields: fields || []
      })
    })
    
    res.data.slack.attachments = attachments
    console.log('Response to Dialogflow: ' + JSON.stringify(res));
    response.json(res);
  })
}

server.use(cors);
server.use(cookieParser);

server.get('/',dialogflowFirebaseFulfillment)
  .post('/',dialogflowFirebaseFulfillment)

server.get('/hello', (req, res) => {
  const url = `https://gitlab.com/api/v4/projects/4372969/issues?private_token=${gitlab_access_token}`
  request.get(url, (err, response, body) => {
    if (err) console.log("err", err)
    res.json(JSON.parse(body))
  })
  
});

exports.oly = functions.https.onRequest(server);