const mq = require('ibmmq');

var MQC = mq.MQC;

// Set up debug logging options
let debug_info = require('debug')('mqapp-mqclient:info');
let debug_warn = require('debug')('mqapp-mqclient:warn');

const _HCONNKEY = Symbol('hconn');
const _HOBJKEY = Symbol('hObj');


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



        reject("Not yet ready - 001");
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


      reject("CNO build logic not yet ready");
    });
  }



}

module.exports = MQClient;
