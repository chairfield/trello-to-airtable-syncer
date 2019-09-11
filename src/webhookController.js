const winston = require('../config/winston');
const TrelloAction = require('./trelloAction');
const WebhookService = require('./webhookService');

module.exports = function WebhookController() {
    this.handleWebhook = async function(action) {
        const trelloAction = new TrelloAction(action);

        let commentToAppend = 'On ' + new Date().toISOString() + ', ' + trelloAction.user.fullName;
        switch (trelloAction.type) {
            case 'commentCard':
                commentToAppend += ' commented: "' + trelloAction.commentText + '"';
                break;
            case 'addAttachmentToCard':
                commentToAppend += ' added an attachment: ' + JSON.stringify(trelloAction.attachment);
                break;
            case 'deleteAttachmentFromCard':
                commentToAppend += ' removed an attachment: ' + JSON.stringify(trelloAction.attachment);
                break;
            default:
                winston.debug('Ignoring action of type: ' + trelloAction.type);
                return 200;
        }

        return new WebhookService().handleWebhook(trelloAction, commentToAppend);
    };
};
