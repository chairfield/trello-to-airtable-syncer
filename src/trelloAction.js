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

    get actionData() {
        return this._data;
    }
}

module.exports = TrelloAction;
