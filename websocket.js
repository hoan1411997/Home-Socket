var bodyParser = require("body-parser");
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8888;
var http = require('http');
var path = require("path");
let count = 0;
let devices = {};
let clients = {};
let mac = {};
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//const DATABASE = require('./modules/database');
const server = http.createServer(app);
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('Addr: ' + add);
})

const WebSocket = require('ws');
const socket = new WebSocket.Server({ server });

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/report', (req, res, next) => {
    return res.send({
        status: 200,
        data: {
            count,
            clients,
            devices,
            mac
        }

    })
})

app.get('/timeMilisLock', function (req, res) {
    socket.clients.forEach(function (client) { //broadcast incoming message to all clients (s.clients)
        if (client.readyState) { //except to the same client (ws) that sent this message
            client.send("2000");
        }
    });

    res.status(200).send({})
});
socket.on('connection', function (ws, req) {
    console.log("New Client");

    count++;
    var data;
    ws.on('message', function (message) {
        console.log(message)
        try {
            data = JSON.parse(message ? message.replaceAll("\'", "\"") : "{}");
        } catch (e) {
            data = null;
        }
        if (data && data.id) {
            ws.id = data.id;
            if (!devices[data.id]) devices[data.id] = {}
            devices[data.id].mac = data.mac;

            if (!mac[data.mac]) mac[data.mac] = {}
            mac[data.mac].device = data.id;
        }
    });
    ws.on('close', function () {
        count--;
        console.log("lost one client");
    });
});
server.listen(PORT);

var setPassWord = (id,pass)=>{

    socket.clients.forEach(function (client) { //broadcast incoming message to all clients (s.clients)
        if (client.readyState&&client.id==id) { //except to the same client (ws) that sent this message
            client.send();
        }
    });

}
var setTime = (id,timeMilisLock)=>{
    socket.clients.forEach(function (client) { //broadcast incoming message to all clients (s.clients)
        if (client.readyState&&client.id==id) { //except to the same client (ws) that sent this message
            client.send(timeMilisLock);
        }
    });
}

