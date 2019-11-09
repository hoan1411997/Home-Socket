const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const DATABASE = require('./modules/database');
const PORT = 5678;


let clients = [];
app.use("/assets", express.static(__dirname + "/public"));
app.set("views", "./views");

// app.get('/', (req, res, next) => {
//     res.send({
//         status: 200,
//         message: "It's ok"
//     })
//     next()
// })

// app.get('/clients', (req, res, next) => {
//     res.send({
//         status: 200,
//         data: clients
//     })
//     next()
// })

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
});
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


