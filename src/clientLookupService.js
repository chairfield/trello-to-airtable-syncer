const debug = require('debug')('trello-to-airtable-syncer:clientLookupService');
const AirtableDAL = require('./airtableDAL');

module.exports = function ClientLookupService() {
    this.findMatchingClient = async function(trelloCard) {
        const records = await new AirtableDAL().selectClientsByNamePrefix(trelloCard);

        records.forEach(function(record) {
            debug("Retrieved record '%s', id=%s", record.get("Client Name"), record.id);
        });

        if (records.length > 0) {
            return records[0];
        } else {
            throw new Error("No records returned.");
        }

        // TODO: Filter down to the newest record to update
        // TODO: Email if there are 2+ records submitted around the same time
        // TODO: If there are multiple records and their names are different, that's an error (either that, or change my
        // prefix query to be for exact matches only)
    };
};
