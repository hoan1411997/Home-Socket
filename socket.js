const express = require('express');
const app_ = express();
const server = require('http').Server(app_);
const io = require('socket.io')(server);
const DATABASE = require('./modules/database');
const PORT = 8888;


let clients = [];


app_.get('/', (req, res, next) => {
    res.send({
        status: 200,
        message: "It's ok"
    })
    next()
})

app_.get('/clients', (req, res, next) => {
    res.send({
        status: 200,
        data: clients
    })
    next()
})
function ParseJson(jsondata) {
    try {
        return JSON.parse(jsondata)
    } catch (error) {
        return null
    }

}
function sendTime() {

    //Đây là một chuỗi JSON
    var json = {
        message: "Tin nhan", 	//kiểu chuỗi
        ESP8266: 12,									//số nguyê
        soPi: 3.14,										//số thực
        time: new Date()							//Đối tượng Thời gian
    }
    io.sockets.emit('atime', json)
}

io.on("connection", async function (socket) {
  
    socket.emit('welcome', {
        message: 'Connected !!!'
    })
    console.log(`Socket ${socket.id} connected!`);
    clients.push(socket.id)
    socket.on('disconnect', function () {
        console.log('disconnected', socket.id)
       
    });
    socket.on('connection', function (message) {
        console.log(message)
    })

    //khi lắng nghe được lệnh "atime" với một tham số, và chúng ta đặt tên tham số đó là data. Mình thích thì mình đặt thôi
    socket.on('atime', function (data) {
        sendTime()
        console.log(data)
    })
    socket.on('arduino', function (data) {
        io.sockets.emit('arduino', { message: 'R0' });
        console.log(data)
    })
})

server.listen(PORT);


