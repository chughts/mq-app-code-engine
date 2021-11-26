
// Set Logging options
let debug_info = require('debug')('mqapp-server:info');
let debug_warn = require('debug')('mqapp-server:warn');

debug_info("Process env settings are: ");
debug_info("LD_LIBRARY_PATH : ", process.env.LD_LIBRARY_PATH);
debug_info("MQ_INSTALLATION_PATH : ", process.env.MQ_INSTALLATION_PATH);

//process.env.LD_LIBRARY_PATH='/app/node_modules/ibmmq/redist/lib64'
//process.env.MQ_INSTALLATION_PATH='/app/node_modules/ibmmq/redist'


const app = require('./mqapp');
const http = require('http');


// Event listener for HTTP server "listening" event.
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug_info('Listening on ' + bind);
}

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug_warn(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug_warn(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Normalize a port into a number, string, or false.
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}


// Create http server and start listening
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
