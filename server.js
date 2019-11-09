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
let devices={
  
};
let clients = {};
//const DATABASE = require('./modules/database');
let count=0;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/report', (req, res, next) => {
  console.log(req.query)
  io.emit(req.query.cn, new Date().toTimeString());
  return res.send({
    status: 200,
    data: {
      count,
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
io.set('transports', ['websocket']);

const addSocketId = (clients, userId, socketId) => {
  clients[userId] = clients[userId] || []
  clients[userId].push(socketId)
};
const emitEvent = (socketIds = [], io, eventName, data) => {
  socketIds && socketIds.forEach(socketId => {
      io.to(socketId).emit(eventName, data);
  });
};
const removeSocketId = (clients, userId, socket) => {
  clients[userId] = clients[userId].filter(socketId => socketId !== socket.id);
 
};


io.on('connection', (socket) => {
  count++;
  console.log(`Socket ${socket.id} connected!`);
  socket.on('connection', function (message) {
    console.log("Connection",message)

  })
  socket.on('device-authen', function (message) {
    socket.deviceId=message
    console.log("Connection",message)

  })
  socket.on('disconnect', () => {
    count--;
    clients[userId] = clients[userId].filter(socketId => socketId !== socket.id);
  })
});

setInterval(() => io.emit('time', new Date().toTimeString()), 10000);
