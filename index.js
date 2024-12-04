const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

// ใช้ body-parser เพื่อแปลงข้อมูลในโพสต์
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const VERIFY_TOKEN = "AAACCCXXX";  // ใส่ Token ที่คุณตั้งไว้ใน Facebook Developer Console
const PAGE_ACCESS_TOKEN = "EAAIZAPF50goYBOwBQLJY21kiZCeL6WEQF33CVqQZA7wUZAmlyzsQiuwTFElRxLUErFm34IrNxWHXBdL5nMwjlpWcpZCCXwpa9P80MZCg2gnsdo3AQVqTQdDraXPtSZCRPQ4vhxJ2ZCVxmwtjtLiv3SDfXip0ZCuSPuvpTZBKz1fol96ajl7gLXtf1ymYWKCP33o6C4mQZDZD";  // ใส่ Page Access Token ของคุณ

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

// รับข้อความจาก Facebook Messenger
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

// ฟังก์ชันส่งข้อความ
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

// ตั้งค่า Server ให้ทำงานที่ Port 3000
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
