const axios = require('axios');

const MQEvents = require('./mqevents');
const pulser = new MQEvents();

let debug_info = require('debug')('mqapp-mqlistener:info');
let debug_warn = require('debug')('mqapp-mqlistener:warn');

const CATCHUPPAUSE = 4 * 1000; // 4 SECONDS

let lastidnotified = '';

let regendpoint = process.env.REG_ENDPOINT || 'http://localhost:8080'
regendpoint += '/api/mqgetbyid?msgid='


pulser.on('mqevent', (msgData) => {
  debug_info(`${new Date().toISOString()} mqevent received`);
  debug_info('Message Data', msgData);

  tellRegisteredEndpoints(msgData)
  .then((data) => {
    debug_info('Invocation was successfull ', data);
  })
  .catch((err) => {
    debug_warn('Invocation failed ', err);
  });

});

function tellRegisteredEndpoints(msgData) {
  return new Promise((resolve, reject) => {
    debug_info('Will be informing registered endpoints');

    let uri = regendpoint;

    if (!msgData || !msgData['HexStrings'] || !msgData['HexStrings'].MsgId) {
      debug_warn('No MsgId found');
      reject('No MsgId provided');
    } if (lastidnotified === msgData['HexStrings'].MsgId) {
      debug_warn('Same message id as last time');
      pauseForAbit()
      .then(() => {
        reject('Old MsgId');
      })
      .catch((err) => {
        reject(err);
      })

    } else {
      lastidnotified = msgData['HexStrings'].MsgId
      uri += msgData['HexStrings'].MsgId;
      debug_info('Sending request to ', uri);

      axios({
        method: 'GET',
        url: uri
      })
      .then(function(response) {
        debug_info('Status code is ',  response.status);
        switch (response.status) {
          case 200:
          case 201:
            resolve(response.data);
            break;
          default:
            reject('Error Invoking API ', response.statusCode);
            break;
          }
        }).catch(function(err) {
          reject("REST call error : ", err);
        });
    }
  });
}

function pauseForAbit() {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, CATCHUPPAUSE);
  });
}


pulser.start();

debug_info("MQ Event Listener has started");
