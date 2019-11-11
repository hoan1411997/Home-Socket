/*
 * @Author: Tai Dong
 * @Date:   2019-05-31 16:05:17
 * @Last Modified by:   Tai Dong
 * @Last Modified time: 2019-09-24 12:01:57
 */
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

