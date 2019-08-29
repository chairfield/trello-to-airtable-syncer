const debug = require('debug')('trello-to-airtable-syncer:webhookController');
const TrelloAction = require('./trelloAction');
const WebhookService = require('./webhookService');

module.exports = function WebhookController() {
    this.handleWebhook = async function(action) {
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

        // TODO: Add ability to optionally send an email on select errors
        return new WebhookService().handleWebhook(trelloAction, commentToAppend);
    };
};
