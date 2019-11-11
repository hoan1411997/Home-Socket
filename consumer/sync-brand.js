
const axios = require('axios');
const Promise = require('bluebird')
let start = async (app) => {
  console.log('Sync brand is running ....');
  while (true) {
    axios.get(`https://home-socket.herokuapp.com/report`, {
      headers:
      {
        'Content-Type': 'application/json'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    }).then(response => console.log(response.data))

    await Promise.delay(60000) 
  }

}
module.exports = { start };

