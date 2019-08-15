const config = require("config");
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

function verifyTrelloWebhookRequest(request, secret, callbackURL) {
  var base64Digest = function (s) {
    return crypto.createHmac('sha1', secret).update(s).digest('base64');
  }
  var content = JSON.stringify(request.body) + callbackURL;
  var doubleHash = base64Digest(content);
  var headerHash = request.headers['x-trello-webhook'];
  console.log('headerHash', headerHash);
  console.log('doubleHash', doubleHash);
  return doubleHash == headerHash;
}

app.get('/', function(req, res) {
    res.sendStatus(200);
});

app.post('/', function(req, res) {
    const body = req.body;
    console.log('post', body, verifyTrelloWebhookRequest(req, config.trello.secret, config.trello.callbackUrl));
});

app.listen(8080, function(err) {
    if (err){
        throw err;
    }

    console.log('Server started on port 8080.');
});

