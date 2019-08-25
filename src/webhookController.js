const debug = require('debug')('trello-to-airtable-syncer:webhookController');
const ClientLookupService = require('./clientLookupService');
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
                new ClientLookupService().findMatchingClient(
                    trelloAction.card,
                    function(airtableRecord) {
                        // TODO: Implement
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
            default:
                debug("Ignoring action of type %s", trelloAction.type);
        }

        // TODO: If Airtable errors out, return a 500 so we get a retry
        return 200;
    };
};
