const debug = require('debug')('trello-to-airtable-syncer:clientLookupService');
const AirtableDAL = require('./airtableDAL');

module.exports = function ClientLookupService() {
    this.findMatchingClient = async function(trelloCard) {
        const records = await new AirtableDAL().selectClientsByNamePrefix(trelloCard);

        records.forEach(function(record) {
            // TODO: Update Airtable by appending newest comment
            debug("Retrieved record '%s', id=%s", record.get("Client Name"), record.id);
        });

        if (records.length > 0) {
            return records[0];
        } else {
            throw new Error("No records returned.");
        }

        // TODO: Filter down to the newest record to update
        // TODO: Email if there are 2+ records submitted around the same time
    };
};
