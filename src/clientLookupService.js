const debug = require('debug')('trello-to-airtable-syncer:clientLookupService');
const AirtableDAL = require('./airtableDAL');

module.exports = function ClientLookupService() {
    this.findMatchingClient = async function(trelloCard) {
        const records = await new AirtableDAL().selectClientsByNamePrefix(trelloCard);
        return this._filterMatch(records);
    };

    this._filterMatch = function(records) {
        records.forEach(function(record) {
            debug("Retrieved record '%s', id=%s", record.get("Client Name"), record.id);
        });

        if (records.length === 0 || records.length > 20) {
            throw new Error(records.length + " records returned.");
        }

        const recordNames = records.map(record => record.get("Client Name"));
        if (recordNames.some(name => name !== recordNames[0])) {
            throw new Error("Not all Client Names matched.");
        }

        // TODO: Filter down to the newest record to update

        // TODO: Email if there are 2+ records submitted around the same time
        return records[0];
    };
};
