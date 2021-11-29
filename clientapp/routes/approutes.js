const express = require('express');
const router = express.Router();

const MQClient = require('../mqclient/mqclient');
let mqclient = new MQClient();

// Set Logging options
let debug_info = require('debug')('mqapp-approutes:info');
let debug_warn = require('debug')('mqapp-approutes:warn');

const APPTITLE = 'MQ apps on CodeEngine';
const DEFAULT_LIMIT = 10;

// GET home page
router.get('/', (req, res, next) => {
  debug_info('Routing to /')
  res.render('index', {
    title: APPTITLE
  });
});


// GET the put page, containing form for messages to send
router.get('/mqput', (req, res, next) => {
  debug_info('Routing to /mqput');
  res.render('mqput', {status: ''});
});


// PUT API expects input containing message and
// quantity.
router.post('/api/mqput', (req, res, next) => {
  debug_info('Routing to /api/mqput');

  let data = req.body;
  debug_info('MQ Put Request submitted for ', data);

  let putRequest = {
    message : 'Message app running in Cloud Engine',
    quantity : 1
  }
  if (data.message) {
    putRequest.message = data.message;
  }
  if (data.quantity) {
    putRequest.quantity = data.quantity;
    if (putRequest.quantity < 0) {
      debug_info('negating the negative quantity provided!');
      putRequest.quantity *= -1;
    } else if (putRequest.quantity === 0) {
      putRequest.quantity = 1;
    }
  }

  debug_info("Attempting MQ Put for ", putRequest);

  mqclient.put(putRequest)
  .then((statusMsg) => {
    res.json({
      status: statusMsg
    });
  })
  .catch((err) => {
    debug_warn("Put has failed with error : ", err);
    res.status(500).send({
      error: err
    });
  });

});


// GET API expects query input for number of messages to get
router.get('/api/mqget', function(req, res, next) {
  debug_info('Routing to /api/mqget');

  let querydata = req.query;
  debug_info('MQ Get Request submitted for ', querydata);

  let getLimit = DEFAULT_LIMIT;
  if (querydata && querydata.limit && !isNaN(querydata.limit)) {
    getLimit = querydata.limit;
  }

  mqclient.get(getLimit)
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.status(500).send({
      error: err
    });
  });
});

module.exports = router;
