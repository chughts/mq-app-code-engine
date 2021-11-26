const mq = require('ibmmq');

// Set up debug logging options
let debug_info = require('debug')('mqapp-mqclient:info');
let debug_warn = require('debug')('mqapp-mqclient:warn');

class MQClient {
  check() {
    debug_info("MQ Client Check function invoked");
  }
}

module.exports = MQClient;
