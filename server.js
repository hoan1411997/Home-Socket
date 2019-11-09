'use strict';
var bodyParser = require('body-parser');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
let device = 0;
let user = 0;
let clients = [];
const DATABASE = require('./modules/database');

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
