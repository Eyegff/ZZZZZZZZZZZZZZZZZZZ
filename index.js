// ใช้งาน dotenv เพื่อโหลด environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

// อ่านข้อมูลจาก environment variables
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// ใช้ body-parser เพื่อแปลงข้อมูลจากโพสต์
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint สำหรับยืนยัน Webhook
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

    // หากข้อความมีการส่งข้อความมา
    if (message && message.text) {
      sendTextMessage(senderId, 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?');
    }
  }

  res.status(200).send('EVENT_RECEIVED');
});

// ฟังก์ชันการส่งข้อความกลับไปยังผู้ใช้
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

// ตั้งค่าให้ server ฟังที่ port 3000
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
