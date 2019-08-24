const AirtableDAL = require('./airtableDAL');
const config = require('config');
const crypto = require('crypto');
const debug = require('debug')('trello-to-airtable-syncer:index');
const express = require('express');

const router = express.Router();

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

  const { action: trelloAction } = req.body;

  if (typeof trelloAction === "undefined" || trelloAction.type !== "commentCard") {
    debug("Ignoring request of type %s", trelloAction.type);
    res.sendStatus(200);
    return;
  }

  const {
    board,
    text: cardText,
    card
  } = trelloAction.data;

  if (board.id !== config.trello.expectedBoardId) {
    debug("Expected a different board id, got %s", board.id);
    res.sendStatus(500);
    return;
  }

  if (card.name.length < 3) {
    debug("Card Name '%s' is too short:", card.name);
    res.sendStatus(200);
    return;
  }

  debug("%s commented '%s' on card '%s'", trelloAction.memberCreator.fullName, cardText, card.name);

  new AirtableDAL().selectClientsByNamePrefix(
      function(records) {
        records.forEach(function(record) {
          // TODO: Update Airtable by appending newest comment
          debug("Retrieved record '%s', id=%s", record.get("Client Name"), record.id);
        });

        // TODO: Filter down to the newest record to update
        // TODO: Email if there are 2+ records submitted around the same time
      },
      function(error) {
        if (error != null) {
          debug(error);
        }
      }
  );

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
