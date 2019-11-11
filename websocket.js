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
    socket.clients.forEach(function (client) {
        if (client.readyState) {
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
        //from device
        if (message == "ON" || message == "OFF") {
            devices[ws.id].state = message;
            changeStateUser(ws.id, message);

        }

        //From mobile
        if (message == "CHANGESTATE") {
            changeState(ws.id);
        }
        if (data && data.newtime) {
            setTime(ws.id, data.newtime);
        }
        if (data && data.newpass) {
            setTime(ws.id, data.newpass);
        }
        if (data && data.sigin) {
            ws.id = data.sigin;
            ws.isUser = true;
            if (!clients[data.sigin]) {
                clients[data.sigin] = {};
                clients[data.sigin].mac = data.mac;
                if (!mac[data.mac]) mac[data.mac] = {}
                mac[data.mac].clients = data.sigin;
            };
        }
        if (data && data.id) {
            ws.id = data.id;
            if (data.user) {
                ws.isUser = true;
                if (!clients[data.id]) clients[data.id] = {}
                clients[data.id].mac = data.mac;

                if (!mac[data.mac]) mac[data.mac] = {}
                mac[data.mac].clients = data.id;
            } else {
                ws.isUser = false;
                if (!devices[data.id]) {
                    devices[data.id] = {};
                    devices[data.id].mac = data.mac;
                    devices[data.id].pass_0 = "0";
                    devices[data.id].pass_1 = "0";
                    devices[data.id].pass_2 = "0";
                    devices[data.id].pass_3 = "0";
                    devices[data.id].time = "5";

                }


                if (!mac[data.mac]) mac[data.mac] = {}
                mac[data.mac].device = data.id;


            }


        }

    });
    ws.on('close', function () {
        count--;
        console.log("lost one client");
    });
});
server.listen(PORT);

var changeState = (fromuserId) => {
    //1111   0000
    var iddevice = null;
    var macId = null;
    var devcive = null;

    if (clients[fromuserId])
        macId = clients[fromuserId].mac;
    if (macId)
        iddevice = mac[macId].device;
    if (iddevice)
        socket.clients.forEach(function (client) {
            if (client.readyState && client.id == iddevice) {
                console.log("CHANGE STATE")
                client.send("-1");
                client.send("1111");
            }
        });
}
var changeStateUser = (deviceId, message) => {
    //1111   0000
    var iddevice = null;
    var macId = null;
    var iduser = null;

    if (devices[deviceId])
        macId = devices[deviceId].mac;
    if (macId)
        iduser = mac[macId].clients;
    if (iduser)
        socket.clients.forEach(function (client) {
            if (client.readyState && client.id == iduser) {
                client.send(message);
            }
        });
}
var setPassWord = (fromuserId, pass) => {
    if (pass && pass.length == 4) {
        var temp = parseInt(pass);
        if (JSON.stringify(temp).length == 4) {
            var iddevice = null;
            var macId = null;
            var devcive = null;
            var pw = JSON.stringify(temp);
            if (clients[fromuserId])
                macId = clients[fromuserId].mac;
            if (macId)
                iddevice = mac[macId].device;
            if (iddevice)
                socket.clients.forEach(function (client) {
                    if (client.readyState && client.id == iddevice) {
                        client.send("1"+pw[0]);
                        client.send("2"+pw[1]);
                        client.send("3"+pw[2]);
                        client.send("4"+pw[3]);
                        devices[iddevice].pass_0 = pw[0];
                        devices[iddevice].pass_1 = pw[1];
                        devices[iddevice].pass_2 = pw[2];
                        devices[iddevice].pass_3 = pw[3];
                    }
                });
        }
    }


}
var setTime = (fromuserId, timeMilisLock) => {
    var iddevice = null;
    var macId = null;
    if (clients[fromuserId])
        macId = clients[fromuserId].mac;
    if (macId)
        iddevice = mac[macId].device;
    if (iddevice)
        socket.clients.forEach(function (client) {
            if (client.readyState && client.id == iddevice) {
                client.send("timeMilisLock");
            }
        });
}
setInterval(() => {
    console.log("UPDATE DATA");
    socket.clients.forEach(function (client) {
        if (!client.isUser && !devices[client.id].time) {
            devices[data.id].pass_0 = "0";
            devices[data.id].pass_1 = "0";
            devices[data.id].pass_2 = "0";
            devices[data.id].pass_3 = "0";
            devices[data.id].time = "5";
        }
        if (client.readyState && client.isUser) {
            console.log(client.readyState, "        ", client.isUser, "         ", client.id, "    ")
            var iddevice = null;
            var ssid = null;
            var devcive = null;
            if (clients[client.id])
                ssid = clients[client.id].mac;
            if (ssid)
                iddevice = mac[ssid].device;
            if (iddevice)
                devcive = devices[iddevice]
            if (devcive) client.send(
                JSON.stringify(devcive)
            );
            client.send(
                '{"mac":"34:A2:A2:CE:40:84","pass_0":"0","pass_1":"0","pass_2":"0","pass_3":"0","time":"5000"}'
            );
            console.log(devcive)
        }
    });

}
    , 5000);

