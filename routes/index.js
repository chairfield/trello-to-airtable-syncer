const airtable = require('airtable');
const config = require('config');
const crypto = require('crypto');
const debug = require('debug')('trello-to-airtable-syncer:index');
const express = require('express');

const router = express.Router();

const base = new airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);

/**
 * GET /, which Trello calls expecting a 200 when configuring its webhook.
 */
router.get('/', function(req, res) {
  res.sendStatus(200);
});

/**
 * POST /, which Trello calls whenever an update occurs.
 */
router.post('/', function(req, res) {
  if (!verifyTrelloWebhookRequest(req, config.trello.secret, config.trello.callbackUrl)) {
    debug("Not a verified Trello webhook. Is your callbackURL correct?");
    res.sendStatus(500);
    return;
  }

  const body = req.body;

  if (typeof body.action === "undefined" || body.action.type !== "commentCard") {
    debug("Ignoring request of type %s", body.action.type);
    res.sendStatus(200);
    return;
  }

  if (body.action.data.board.id !== config.trello.expectedBoardId) {
    debug("Expected a different board id, got %s", body.action.data.board.id);
    res.sendStatus(500);
    return;
  }

  const commentText = body.action.data.text;
  const cardName = body.action.data.card.name;
  const commenterFullName = body.action.memberCreator.fullName;
  debug("%s commented '%s' on card '%s'", commenterFullName, commentText, cardName);

  if (cardName.length < 3) {
    debug("Card Name '%s' is too short:", cardName);
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
        debug("Retrieved record '%s', id=%s", record.get("Client Name"), record.id);
      });

      // TODO: Filter down to the newest record to update
      // TODO: Email if there are 2+ records submitted around the same time

      fetchNextPage();
    } else {
      // TODO: Send a warning email to a configurable list of addresses
      debug("Found 0 records.");
    }
  }, function done(error) {
    if (error != null) {
      debug(error);
    }
  });

  // TODO: If Airtable errors out, return a 500 so we get a retry
  res.sendStatus(200);
});

function verifyTrelloWebhookRequest(request, secret, callbackURL) {
  const base64Digest = function (s) {
    return crypto.createHmac('sha1', secret).update(s).digest('base64');
  };
  const content = JSON.stringify(request.body) + callbackURL;
  const doubleHash = base64Digest(content);
  const headerHash = request.headers['x-trello-webhook'];
  return doubleHash === headerHash;
}

module.exports = router;
