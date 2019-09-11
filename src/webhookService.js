const config = require('config');
const winston = require('../config/winston');
const AirtableDAL = require('./airtableDAL');
const ClientLookupService = require('./clientLookupService');

function appendComment(currentComments, commentToAppend) {
    return currentComments === undefined ? commentToAppend : currentComments + '\n\n' + commentToAppend;
}

function validateWebhook(trelloAction) {
    if (trelloAction.board.id !== config.trello.expectedBoardId) {
        const errorMessage = 'Invalid Trello board id: ' + trelloAction.board.id;
        winston.error(errorMessage);
        throw new Error(errorMessage);
    }

    if (trelloAction.card.name.length < 5) {
        const errorMessage = 'Card name is too short: ' + trelloAction.card.name;
        winston.error(errorMessage);
        throw new Error(errorMessage);
    }
}

module.exports = function WebhookService() {
    this.handleWebhook = async function (trelloAction, commentToAppend) {
        winston.info(commentToAppend);
        try {
            validateWebhook(trelloAction);
            const airtableRecord = await new ClientLookupService().findMatchingClient(trelloAction.card);
            winston.info('Appending the following comment: ' + commentToAppend);
            await new AirtableDAL().updateClient(
                airtableRecord.id,
                appendComment(airtableRecord.get('Trello Comments'), commentToAppend));
        } catch (error) {
            winston.error(error.toString(), trelloAction);

            // TODO: Differentiate between user (e.g., user not found) and system (e.g., airtable timing out) errors
        }

        return 200;
    };
};
