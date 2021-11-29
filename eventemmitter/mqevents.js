const EventEmitter = require('events');
const MQClient = require('./mqclient/mqclient');
let mqclient = new MQClient();

let debug_info = require('debug')('mqapp-mqevents:info');
let debug_warn = require('debug')('mqapp-mqevents:warn');

const INTERVAL = 8000;

class MQEvents extends EventEmitter {
    start() {
        setInterval(() => {
          debug_info("MQ Event Emitter Interval awakening");
          this.performMQQueueCheck()
          .then((msgData) => {
            debug_info('Found Message ', msgData);
            debug_info(`${new Date().toISOString()} >>>> pulse`);
            if (msgData) {
              this.emit('mqevent', msgData);
            }
            debug_info(`${new Date().toISOString()} <<<< pulse`);
          })
          .catch((err) => {
            debug_warn('Error detected in MQEvents EventEmitter ', err);
          })
        }, INTERVAL);
    }

    performMQQueueCheck() {
      return new Promise((resolve, reject) => {
        debug_info('Checking MQ for Messages');
        mqclient.browse()
        .then((msgData) => {
          resolve(msgData);
        })
        .catch((err) => {
          reject(err);
        });
      });
    }
}

module.exports = MQEvents;
