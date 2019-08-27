const config = require('config');
const debug = require('debug')('trello-to-airtable-syncer:webhookController');
const AirtableDAL = require('./airtableDAL');
const ClientLookupService = require('./clientLookupService');
const TrelloAction = require('./trelloAction');

function generateCommentString(trelloAction) {
    const prefix = "On " + new Date().toISOString() + ", " + trelloAction.user.fullName;
    switch (trelloAction.type) {
        case "commentCard":
            return prefix + " commented: \"" + trelloAction.commentText + "\"";
        case "addAttachmentToCard":
            return prefix + " added an attachment: " + JSON.stringify(trelloAction.attachment);
        case "deleteAttachmentFromCard":
            return prefix + " removed an attachment: " + JSON.stringify(trelloAction.attachment);
    }

    throw new Error("Trying to generate a comment for an invalid webhook type.");
}

module.exports = function WebhookController() {
    this.handleWebhook = function(action) {
        const trelloAction = new TrelloAction(action);
        switch (trelloAction.type) {
            case "commentCard":
            case "addAttachmentToCard":
            case "deleteAttachmentFromCard":
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
                const commentToAppend = generateCommentString(trelloAction);
                debug("Appending the following comment: " + commentToAppend);

                function appendComment(currentComments, commentToAppend) {
                    return currentComments === undefined ?  commentToAppend : currentComments + commentToAppend;
                }

                new AirtableDAL().updateClient(
                    airtableRecord.id,
                    appendComment(airtableRecord.get("Trello Comments"), commentToAppend) + "\n\n");
            },
            function(error) {
                // TODO: Implement
            });

        // TODO: If Airtable errors out, return a 500 so we get a retry
        return 200;
    };
};
