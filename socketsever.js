var sync = require("./consumer/api").start;
sync();
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
        if (message != "alive-s") {
            console.log(message)
            try {
                var mes = message.replaceAll("\'", "\"");
                data = JSON.parse(mes);

            } catch (e) {
                if (message != "alive-s") console.log(".")
                data = null;
            }
        }
        if (message == "alive-s") {
            console.log(ws.id + " alive " + new Date().getTime())
            devices[ws.id].connect = true;
            devices[ws.id].timelive = new Date().getTime();
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
            setPassWord(ws.id, data.newpass);
        }
        if (data && data.sigin) {
            console.log("USER")
            ws.id = data.sigin;
            ws.isUser = true;
            if (!clients[data.sigin]) {
                console.log("Create")
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
                ws.isDevice = true;
                if (!devices[data.id]) {
                    devices[data.id] = {};
                    devices[data.id].mac = data.mac;
                    devices[data.id].pass_0 = "0";
                    devices[data.id].pass_1 = "0";
                    devices[data.id].pass_2 = "0";
                    devices[data.id].pass_3 = "0";
                    devices[data.id].time = "5000";

                    ws.send("1" + 0);
                    ws.send("2" + 0);
                    ws.send("3" + 0);
                    ws.send("4" + 0);
                    ws.send(5000);

                }


                if (!mac[data.mac]) mac[data.mac] = {}
                mac[data.mac].device = data.id;


            }
        }

    });
    ws.on('close', function () {
        count--;
        console.log("lost one client:" + ws.id);
        if (ws.id && devices[ws.id]) {
            devices[ws.id].state = "DISCONNECT";
            devices[ws.id].connect = false;
        }
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
    // var iddevice = null;
    // var macId = null;
    // var iduser = null;

    // if (devices[deviceId])
    //     macId = devices[deviceId].mac;
    // if (macId)
    //     iduser = mac[macId].clients;
    // if (iduser)
    socket.clients.forEach(function (client) {
        if (client.readyState && client.isUser) {
            client.send(message);
        }
    });
}
var setPassWord = (fromuserId, pass) => {
    if (pass && pass.length == 4) {


        var iddevice = null;
        var macId = null;

        var pw = JSON.stringify(pass);
        if (clients[fromuserId])
            macId = clients[fromuserId].mac;
        if (macId)
            iddevice = mac[macId].device;
        if (iddevice)
            socket.clients.forEach(function (client) {
                if (client.readyState && client.id == iddevice) {
                    console.log("UPDATE PASS")
                    client.send("1" + pw[0]);
                    client.send("2" + pw[1]);
                    client.send("3" + pw[2]);
                    client.send("4" + pw[3]);
                    devices[iddevice].pass_0 = pw[0];
                    devices[iddevice].pass_1 = pw[1];
                    devices[iddevice].pass_2 = pw[2];
                    devices[iddevice].pass_3 = pw[3];
                }
            });

    }


}
var setTime = (fromuserId, timeMilisLock) => {
    var iddevice = null;
    var macId = null;
    if (timeMilisLock && timeMilisLock.length >= 4) {
        if (clients[fromuserId])
            macId = clients[fromuserId].mac;
        if (macId)
            iddevice = mac[macId].device;
        if (iddevice) {
            devices[iddevice].time = timeMilisLock;
            socket.clients.forEach(function (client) {
                if (client.readyState && client.id == iddevice) {
                    client.send(timeMilisLock);
                }
            });
        }
    }
}
setInterval(() => {

    var keyDevices = Object.keys(devices);
    if (keyDevices && keyDevices.length > 0)
        keyDevices.forEach(function (n, key) {
            if (((new Date().getTime()) - devices[key].timelive) > 1500) {
                devices[key].connect = false;
                devices[key].state = "DISCONNECT";
            }

        });
    socket.clients.forEach(function (client) {
        if (client.id && client.isDevice && !devices[client.id].time) {
            devices[data.id].pass_0 = "0";
            devices[data.id].pass_1 = "0";
            devices[data.id].pass_2 = "0";
            devices[data.id].pass_3 = "0";
            devices[data.id].time = "5000";

            client.send("10");
            client.send("20");
            client.send("30");
            client.send("40");
            client.send(5000);
        }
        if (client.readyState && client.isUser) {
            // console.log(client.readyState, "        ", client.isUser, "         ", client.id, "    ")
            // var iddevice = null;
            // var ssid = null;
            // var device = null;
            // if (clients[client.id])
            //     ssid = clients[client.id].mac;
            // if (ssid)
            //     iddevice = mac[ssid].device;
            // if (iddevice)
            let device = devices["lock01"]

            if (device) client.send(
                JSON.stringify(device)
            );
            // client.send(
            //     '{"mac":"34:A2:A2:CE:40:84","pass_0":"0","pass_1":"0","pass_2":"0","pass_3":"0","time":"5000"}'
            // );
            //console.log(device)
        }
        if (client.readyState && !client.id) {
            client.send(new Date().toTimeString());
        }
        if (client.readyState && client.isDevice) {
            client.send("alive");
            client.send("alive-n");
        }
    });

}
    , 600);

