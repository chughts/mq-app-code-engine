const express = require('express');
const router = express.Router();

// Set Logging options
let debug_info = require('debug')('mqapp-approutes:info');
let debug_warn = require('debug')('mqapp-approutes:warn');

const APPTITLE = 'MQ apps on CodeEngine';

/* GET home page. */
router.get('/', function(req, res, next) {
  debug_info('Routing to /')
  res.render('index', {
    title: APPTITLE
  });
});


router.get('/mqput', function(req, res, next) {
  debug_info('Routing to /mqput');
  res.render('mqput', {status: ''});
});

module.exports = router;
