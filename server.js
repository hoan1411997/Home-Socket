'use strict';
var bodyParser = require('body-parser');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8888;
const INDEX = path.join(__dirname, 'index.html');
let device = 0;
let user = 0;
let clients = [];
const DATABASE = require('./modules/database');
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/report', (req, res, next) => {
 return res.send({
    status: 200,
    data: {
      clients,
      device,
      user
    }
  })
 
})
const server = app
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

io.on('connection', (socket) => {
  clients.push(socket.id)
  console.log('Client connected');
  console.log(`Socket ${socket.id} connected!`);

  socket.on('connection', function (message) {
    console.log(message)
  })
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
