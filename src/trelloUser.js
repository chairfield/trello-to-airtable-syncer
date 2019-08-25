class TrelloUser {
    constructor(user) {
        this._username = user.username;
        this._fullName = user.fullName;
    }

    /**
     * Gets the username (e.g., 'chrishairfield') of the Trello user who performed the action.
     * @returns {string} The username of the Trello user who performed the action.
     */
    get username() {
        return this._username;
    }

    /**
     * Gets the full name (e.g., 'Chris Hairfield') of the Trello user who performed the action.
     * @returns {string} The full name of the Trello user who performed the action.
     */
    get fullName() {
        return this._fullName;
    }
}

module.exports = TrelloUser;
