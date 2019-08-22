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
  return doubleHash == headerHash;
}

app.get('/', function(req, res) {
    res.sendStatus(200);
});

app.post('/', function(req, res) {
    const body = req.body;
    console.log(body.action);
    if (!verifyTrelloWebhookRequest(req, config.trello.secret, config.trello.callbackUrl)) {
        console.log("Not a verified Trello webhook. Is your callbackURL correct?");
        res.sendStatus(500);
        return;
    }

    if (typeof body.action === "undefined" || body.action.type !== "commentCard") {
        console.log("Ignoring request of type: " + body.action.type);
        res.sendStatus(200);
        return;
    }

    if (body.action.data.board.id !== config.trello.expectedBoardId) {
        console.log("Expected a different board id, got:", body.action.data.board.id);
        res.sendStatus(500);
        return;
    }

    const commentText = body.action.data.text;
    const cardName = body.action.data.card.name;
    const commenterFullName = body.action.memberCreator.fullName;
    console.log("A Trello user commented:", commentText, "-", cardName, "-", commenterFullName);
    res.sendStatus(200);
});

app.listen(8080, function(err) {
    if (err) {
        throw err;
    }

    console.log('Server started on port 8080.');
});

