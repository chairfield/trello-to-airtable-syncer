const config = require('config');
const debug = require('debug')('trello-to-airtable-syncer:webhookController');
const AirtableDAL = require('./airtableDAL');
const ClientLookupService = require('./clientLookupService');
const TrelloAction = require('./trelloAction');

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

        // TODO: Make this configurable, and able to support a list of lists to filter by id
        if (trelloAction.list.name === "Information for volunteers"
            || trelloAction.list.id === "5cca20f711b3e979997d48f1") {
            debug("Skipping action on Trello list: %s", trelloAction.list.name);
            return 200;
        }

        if (trelloAction.card.name.length < 5) {
            debug("Card name is too short: %s", trelloAction.card.name);
            // TODO: email error
            return 200;
        }

        // TODO: Test each action type
        switch (trelloAction.type) {
            case "commentCard":
                debug(
                    "%s commented '%s' on card '%s'",
                    trelloAction.user.fullName,
                    trelloAction.commentText,
                    trelloAction.card.name);
                new ClientLookupService().findMatchingClient(
                    trelloAction.card,
                    function(airtableRecord) {
                        const commentToAppend =
                            "On " + new Date().toISOString() + ", " + trelloAction.user.fullName
                                + " wrote: \"" + trelloAction.commentText + "\"\n\n";

                        function appendComment(currentComments, commentToAppend) {
                            return currentComments === undefined ?  commentToAppend : currentComments + commentToAppend;
                        }

                        new AirtableDAL().updateClient(
                            airtableRecord.id,
                            appendComment(airtableRecord.get("Trello Comments"), commentToAppend));
                    },
                    function(error) {
                        // TODO: Implement
                    });

                break;
            case "addAttachmentToCard":
                debug(
                    "%s added attachment '%s' on card '%s'",
                    trelloAction.user.fullName,
                    trelloAction.attachment.name,
                    trelloAction.card.name);
                debug("not yet implemented");
                break;
            case "deleteAttachmentFromCard":
                debug(
                    "%s deleted attachment '%s' from card '%s'",
                    trelloAction.user.fullName,
                    trelloAction.attachment.name,
                    trelloAction.card.name);
                debug("not yet implemented");
                break;
        }

        // TODO: If Airtable errors out, return a 500 so we get a retry
        return 200;
    };
};
