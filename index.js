// Import the dotenv package to load the environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

// Use environment variables for sensitive data
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Use body-parser to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Verify the webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Handle messages from Facebook Messenger
app.post('/webhook', (req, res) => {
  const messagingEvents = req.body.entry[0].messaging;

  for (let i = 0; i < messagingEvents.length; i++) {
    const event = messagingEvents[i];
    const senderId = event.sender.id;
    const message = event.message;

    if (message && message.text) {
      sendTextMessage(senderId, 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?');
    }
  }

  res.status(200).send('EVENT_RECEIVED');
});

// Function to send a text message back to the user
function sendTextMessage(senderId, messageText) {
  const messageData = {
    recipient: { id: senderId },
    message: { text: messageText }
  };

  request({
    url: 'https://graph.facebook.com/v12.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending message:', error);
    } else if (response.body.error) {
      console.error('Error:', response.body.error);
    }
  });
}

// Set up the server to listen on port 3000
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
