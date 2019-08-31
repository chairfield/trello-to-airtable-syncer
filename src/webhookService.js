const config = require('config');
const debug = require('debug')('trello-to-airtable-syncer:webhookService');
const AirtableDAL = require('./airtableDAL');
const ClientLookupService = require('./clientLookupService');

function appendComment(currentComments, commentToAppend) {
    return currentComments === undefined ? commentToAppend : currentComments + '\n\n' + commentToAppend;
}

function validateWebhook(trelloAction) {
    if (trelloAction.board.id !== config.trello.expectedBoardId) {
        debug('Invalid Trello board id: %s', trelloAction.board.id);
        throw new Error('Invalid Trello board id: ' + trelloAction.board.id);
    }

    if (trelloAction.card.name.length < 5) {
        debug('Card name is too short: %s', trelloAction.card.name);
        throw new Error('Card name is too short: ' + trelloAction.card.name);
    }
}

module.exports = function WebhookService() {
    this.handleWebhook = async function (trelloAction, commentToAppend) {
        try {
            validateWebhook(trelloAction);
            const airtableRecord = await new ClientLookupService().findMatchingClient(trelloAction.card);
            debug('Appending the following comment: ' + commentToAppend);
            new AirtableDAL().updateClient(
                airtableRecord.id,
                appendComment(airtableRecord.get('Trello Comments'), commentToAppend));
        } catch (error) {
            debug(error);

            // TODO: Differentiate between user (e.g., user not found) and system (e.g., airtable timing out) errors
            // TODO: Pass up enough information for the controller to optionally send an email
        }

        return 200;
    };
};
