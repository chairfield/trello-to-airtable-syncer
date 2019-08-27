const config = require('config');
const debug = require('debug')('trello-to-airtable-syncer:webhookController');
const AirtableDAL = require('./airtableDAL');
const ClientLookupService = require('./clientLookupService');
const TrelloAction = require('./trelloAction');

function appendComment(currentComments, commentToAppend) {
    return currentComments === undefined ? commentToAppend : currentComments + "\n\n" + commentToAppend;
}

module.exports = function WebhookController() {
    this.handleWebhook = function(action) {
        const trelloAction = new TrelloAction(action);

        let commentToAppend = "On " + new Date().toISOString() + ", " + trelloAction.user.fullName;
        switch (trelloAction.type) {
            case "commentCard":
                commentToAppend += " commented: \"" + trelloAction.commentText + "\"";
                break;
            case "addAttachmentToCard":
                commentToAppend += " added an attachment: " + JSON.stringify(trelloAction.attachment);
                break;
            case "deleteAttachmentFromCard":
                commentToAppend += " removed an attachment: " + JSON.stringify(trelloAction.attachment);
                break;
            default:
                debug("Ignoring action of type %s", trelloAction.type);
                return 200;
        }

        if (trelloAction.board.id !== config.trello.expectedBoardId) {
            debug("Invalid Trello board id: %s", trelloAction.board.id);
            // TODO: email error
            return 200;
        }

        if (trelloAction.card.name.length < 5) {
            debug("Card name is too short: %s", trelloAction.card.name);
            // TODO: email error
            return 200;
        }

        new ClientLookupService().findMatchingClient(
            trelloAction.card,
            function(airtableRecord) {
                debug("Appending the following comment: " + commentToAppend);
                new AirtableDAL().updateClient(
                    airtableRecord.id,
                    appendComment(airtableRecord.get("Trello Comments"), commentToAppend));
            },
            function(error) {
                // TODO: Implement
            });

        // TODO: If Airtable errors out, return a 500 so we get a retry
        return 200;
    };
};
