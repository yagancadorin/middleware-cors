var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({limit: myLimit}));

app.use(bodyParser.text());

app.all('*', function (req, res, next) {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*");

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send();
  } else {
    var targetURL = req.header('Target-URL');
    if (!targetURL) {
      res.send(500, { error: 'There is no Target-Endpoint header in the request' });
      return;
    }

    request({ url: targetURL + req.url, method: req.method, body: req.body, headers: {"Authorization": req.header('Authorization'), "Client-ID": req.header('Client-ID')} },
      function (error, response, body) {
        if (error) {
          console.error('error: ' + response.statusCode)
        }
      }).pipe(res);
  }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
  console.log('Proxy server listening on port ' + app.get('port'));
});