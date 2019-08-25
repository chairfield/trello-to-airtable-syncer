const debug = require('debug')('trello-to-airtable-syncer:clientLookupService');
const AirtableDAL = require('./airtableDAL');

module.exports = function ClientLookupService() {
    this.findMatchingClient = function(trelloCard, successHandler, errorHandler) {
        new AirtableDAL().selectClientsByNamePrefix(
            trelloCard,
            function(records) {
                records.forEach(function(record) {
                    // TODO: Update Airtable by appending newest comment
                    debug("Retrieved record '%s', id=%s", record.get("Client Name"), record.id);
                });

                if (records.length > 0) {
                    successHandler(records[0]);
                } else {
                    // TODO: Gracefully handle errors
                    errorHandler("No records returned.")
                }

                // TODO: Filter down to the newest record to update
                // TODO: Email if there are 2+ records submitted around the same time
            },
            function(error) {
                if (error != null) {
                    debug(error);
                    // TODO: Gracefully handle errors
                    errorHandler(error);
                }
            }
        );
    };
};
