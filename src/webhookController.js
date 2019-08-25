const AirtableDAL = require('./airtableDAL');
const debug = require('debug')('trello-to-airtable-syncer:webhookController');
const TrelloAction = require('./trelloAction');

module.exports = function WebhookController() {
    this.handleWebhook = function(action) {
        const trelloAction = new TrelloAction(action);

        if (trelloAction.type !== "commentCard") {
            debug("Ignoring request of type %s", trelloAction.type);
            return 200;
        }

        const {
            text: cardText,
            card
        } = trelloAction.actionData;

        if (card.name.length < 3) {
            debug("Card Name '%s' is too short:", card.name);
            return 200;
        }

        debug("%s commented '%s' on card '%s'", trelloAction.user.fullName, cardText, card.name);

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
        return 200;
    };
};
