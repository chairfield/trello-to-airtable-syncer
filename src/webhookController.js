const AirtableDAL = require('./airtableDAL');
const debug = require('debug')('trello-to-airtable-syncer:webhookController');
const TrelloAction = require('./trelloAction');

module.exports = function WebhookController() {
    this.handleWebhook = function(action) {
        const trelloAction = new TrelloAction(action);

        // TODO: TDD the correct validations on card, list, and board
        if (trelloAction.card.name.length < 3) {
            debug("Card Name '%s' is too short:", card.name);
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
            default:
                debug("Ignoring action of type %s", trelloAction.type);
        }

        // TODO: If Airtable errors out, return a 500 so we get a retry
        return 200;
    };
};
