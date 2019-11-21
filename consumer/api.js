
var bodyParser = require("body-parser");
const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;
var http = require('http');
var path = require("path");
const axios = require('axios');
const Promise = require('bluebird');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', function (req, res) {
  res.send(200);
});
let start = async () => {
  return app.listen(PORT)

}
module.exports = { start };

