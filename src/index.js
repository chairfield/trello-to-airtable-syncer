const config = require('config');
const crypto = require('crypto');
const debug = require('debug')('trello-to-airtable-syncer:index');
const express = require('express');
const WebhookController = require('./webhookController');

const router = express.Router();

/**
 * GET /, which Trello calls expecting a 200 when configuring its webhook. It doesn't pass the Trello model id it's been
 * setup for in any way (header, query param).
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

  const {
    model,
    action
  } = req.body;

  if (model.id !== config.trello.expectedBoardId) {
    debug("Expected a different board id, got %s", model.id);
    res.sendStatus(500);
    return;
  }

  if (typeof action === "undefined") {
    debug("req.body.action is undefined");
    res.sendStatus(500);
    return;
  }

  const status = new WebhookController().handleWebhook(action);
  res.sendStatus(status);
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
