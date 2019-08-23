const config = require("config");
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const airtable = require('airtable');

const base = new airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);

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

    if (cardName.length < 3) {
        console.log("Card Name is too short:", cardName);
        res.sendStatus(200);
        return;
    }

    // TODO: Make table name configurable
    base('Cases as of 6/13/19').select({
        // TODO: Only select the fields that I need
        filterByFormula: "FIND(" + "'Torres'" + ",{Client Name})>=1"
    }).eachPage(function page(records, fetchNextPage) {
        if (records.length > 0) {
            records.forEach(function(record) {
                // TODO: Update Airtable by appending newest comment
                console.log("Retrieved", record.get("Client Name"), record.id);
            });

            // TODO: Filter down to the newest record to update
            // TODO: Email if there are 2+ records submitted around the same time

            fetchNextPage();
        } else {
            // TODO: Send a warning email to a configurable list of addresses
            console.log("Found 0 records.");
        }
    }, function done(error) {
        if (error != null) {
            console.log(error);
        }
    });

    // TODO: If Airtable errors out, return a 500 so we get a retry
    res.sendStatus(200);
});

app.listen(8080, function(err) {
    if (err) {
        throw err;
    }

    console.log('Server started on port 8080.');
});

