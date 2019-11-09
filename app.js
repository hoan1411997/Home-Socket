var express = require('express');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');

var port = 5678;
var app = express();
app.use("/assets", express.static(__dirname + "/public"));
app.set("views", "./views");
// Add headers---------------------------------------------------------------------------------------------------------------
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
app.use('/', index);
app.use('/users', users);

//body parser---------------------------------------------------------------------------------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const DATABASE = require('./modules/database');
//FACEAPI---------------------------------------------------------------------------------------------------------------
console.log("START APP.JS");
// const MCSFACEAPI = require('./modules/face-api');
// const key = "6dcb5374a96048acadb4f4981578b478";
// const sever = "WCUS";
// var mcsfapi = new MCSFACEAPI(key, sever);


//-------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------------------------------
// app.listen(port, function () {
// 	console.log("LISTEN ",window.location.hostname, port);
// });
app.listen(process.env.PORT || port, function(){
	console.log("LISTEN server listening on port %d in %s mode", this.address().port, app.settings.env);
});


