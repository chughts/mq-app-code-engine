const mq = require('ibmmq');

// Load up missing envrionment variables from the env.json file
const env = require('../env.json');

var MQC = mq.MQC;

// Set up debug logging options
let debug_info = require('debug')('mqapp-mqclient:info');
let debug_warn = require('debug')('mqapp-mqclient:warn');

const _HCONNKEY = Symbol('hconn');
const _HOBJKEY = Symbol('hObj');


// Load the MQ Endpoint details either from the envrionment or from the
// env.json file. The envrionment takes precedence.
// The json file allows for
// mulitple endpoints ala a cluster. The connection string is built
// using the host(port) values for all the endpoints.
// For all the other fields only the first
// endpoint in the arryay is used.
var MQDetails = {};

['QMGR', 'QUEUE_NAME', 'HOST', 'PORT', 'MQ_PORT',
 'CHANNEL', 'KEY_REPOSITORY', 'CIPHER'].forEach(function(f) {
  MQDetails[f] = process.env[f] || env.MQ_ENDPOINTS[0][f]
});

if (MQDetails['MQ_PORT']) {
  MQDetails['PORT'] = MQDetails['MQ_PORT'];
}

var credentials = {
  USER: process.env.APP_USER || env.MQ_ENDPOINTS[0].APP_USER,
  PASSWORD: process.env.APP_PASSWORD || env.MQ_ENDPOINTS[0].APP_PASSWORD
};


class MQClient {

  constructor() {
    this[_HCONNKEY] = null;
    this[_HOBJKEY] = null;
  }

  check() {
    debug_info("MQ Client Check function invoked");
  }

  put(putRequest) {
    return new Promise((resolve, reject) => {
      let message = 'Message from app running in Cloud Engine';
      let quantity = 1;
      if (putRequest) {
        if (putRequest.message) {
          message = putRequest.message;
        }
        if (putRequest.quantity) {
          quantity = putRequest.quantity;
        }
      }

      debug_info("Will be putting message ", message);

      this.makeConnectionPromise()
      .then(() => {
        debug_info("Connected to MQ");
        reject("not complete yet");
      })
      .catch((err) => {
        debug_warn("Failed to connect to MQ");
        debug_info(err);

        reject(err);
      });

    });
  }

  // Internal routines

  performConnection() {
    return new Promise((resolve, reject) => {
      this.buildCNO()
      .then((cno) => {
        debug_info("CNO Built");
        return mq.ConnxPromise(MQDetails.QMGR, cno);
      })
      .then((hconn) => {
        debug_info("Connected to MQ");


        reject("Not yet ready - 003");
      })
      .catch((err) => {
        debug_warn("Error establising connection to MQ");
        debug_warn(err);
        reject(err);
      });


    });
  }



  makeConnectionPromise() {
    // Check if connection has already been established.
    let connectionPromise = Promise.resolve();
    if (this[_HCONNKEY] === null || this[_HOBJKEY] === null) {
      connectionPromise = this.performConnection();
    }
    return connectionPromise;
  }


  buildCNO() {
    return new Promise((resolve, reject) => {
      debug_info("Building CNO Object");
      let cno = new mq.MQCNO();
      cno.Options = MQC.MQCNO_CLIENT_BINDING;

      let csp = new mq.MQCSP();
      csp.UserId = credentials.USER;
      csp.Password = credentials.PASSWORD;
      cno.SecurityParms = csp;

      // And then fill in relevant fields for the MQCD
      var cd = new mq.MQCD();

      cd.ChannelName = MQDetails.CHANNEL;
      cd.ConnectionName = this.getConnection();
      debug_info('Connections string is ', cd.ConnectionName);

      if (MQDetails.KEY_REPOSITORY) {
        debug_info('Will be running in TLS Mode');

        cd.SSLCipherSpec = MQDetails.CIPHER;
        cd.SSLClientAuth = MQC.MQSCA_OPTIONAL;
      }

      // Make the MQCNO refer to the MQCD
      cno.ClientConn = cd;

      // The location of the KeyRepository is not specified in the CCDT, so regardless
      // of whether a CCDT is being used, need to specify the KeyRepository location
      // if it has been provided in the environment json settings.
      if (MQDetails.KEY_REPOSITORY) {
        debug_info('Key Repository has been specified');
        // *** For TLS ***
        var sco = new mq.MQSCO();

        sco.KeyRepository = MQDetails.KEY_REPOSITORY;
        // And make the CNO refer to the SSL Connection Options
        cno.SSLConfig = sco;
      }

      resolve(cno);
    });
  }


  getConnection() {
    let points = [];

    if (process.env['HOST'] && process.env['MQ_PORT']) {
      let h = process.env['HOST'];
      let p = process.env['MQ_PORT'];
      points.push(`${h}(${p})`)
    } else {
      env.MQ_ENDPOINTS.forEach((p) => {
        if (p['HOST'] && p['PORT']) {
          points.push(`${p.HOST}(${p.PORT})`)
        }
      });
    }

    return points.join(',');
  }


}

module.exports = MQClient;
