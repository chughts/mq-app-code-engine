$(document).ready(() => {
  console.log("Page is loaded");
  mqPageOps.handlersUI();
  mqPageOps.initialiseFields();
})

function MQPageOps () {}
var mqPageOps = new MQPageOps();

mqPageOps.handlersUI = function() {
  $('button#mqputbutton').click(function(event) {
    let message = $('input#message').val();
    let quantity = $('input#quantity').val();
    let status = "Submitting the message " + message + " " + quantity + " times";
    $('span#status').text(status);
    let data = {};
    data.message = message;
    data.quantity = quantity;
    console.log("perform Put Request will go here, when ready!");
    $.ajax({
      type: 'POST',
      url: '/api/mqput',
      data: data,
      success: mqPageOps.postOK,
      error: mqPageOps.notOK
    })
    event.preventDefault();
  });
}

mqPageOps.postOK = function(response) {
  console.log('API response is : ', response)
  let status = 'Message(s) sent sucessfully';
  if (response.status) {
    status = response.status;
  }
  console.log(status);
  $('span#status').text(status);
}

mqPageOps.notOK = function(err) {
  let status = 'REST API Call failed ';
  if (err.statusText) {
    status += err.statusText;
  }
  console.log('REST API Call failed : ', err);
  $('span#status').text(status);
}

mqPageOps.initialiseFields = function() {
  $('span#status').text("Will go here");
}
