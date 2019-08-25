const TrelloUser = require('./trelloUser');

class TrelloAction {
    constructor(action) {
        this._type = action.type;
        this._user = new TrelloUser(action.memberCreator);
        this._date = action.date;
        this._data = action.data;
    }

    /**
     * Gets the type of action (e.g., 'commendCard') that occurred in Trello.
     * @returns {string} The type of action that occurred in Trello.
     */
    get type() {
        return this._type;
    }

    /**
     * Gets the user who triggered the action in Trello.
     * @returns {TrelloUser} The user who triggered the action in Trello.
     */
    get user() {
        return this._user;
    }

    /**
     * Gets the string representation of the date and time the action occurred in Trello.
     * @returns {string} The string representation of the date and time the action occurred in Trello.
     */
    get date() {
        return this._date;
    }

    /**
     * Gets the modified card.
     * @returns {*} The modified card.
     */
    get card() {
        return this._data.card;
    }

    /**
     * Gets the modified list.
     * @returns {*} The modified list.
     */
    get list() {
        return this._data.list;
    }

    /**
     * Gets the modified board.
     * @returns {*} The modified board.
     */
    get board() {
        return this._data.board;
    }

    /**
     * Gets the comment text, if the action is commentCard.
     * @returns {*} The comment text, else undefined.
     */
    get commentText() {
        return this._data.text;
    }

    /**
     * Gets the attachment being added or deleted, if the action is addAttachmentToCard or deleteAttachmentFromCard.
     * @returns {*} The attachment being added or deleted, else undefined.
     */
    get attachment() {
        return this._data.attachment;
    }
}

module.exports = TrelloAction;
