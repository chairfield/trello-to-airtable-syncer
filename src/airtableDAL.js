const airtable = require('airtable');
const config = require('config');
const debug = require('debug')('trello-to-airtable-syncer:airtable');

const PAGE_SIZE = 100;
const base = new airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);

module.exports = function AirtableDAL() {
    this.selectClientsByNamePrefix = function(trelloCard, pageHandler, doneHandler) {
        debug("Searching for client '%s'", trelloCard.name);
        // TODO: Make table name configurable
        base('Cases as of 6/13/19').select({
            fields: ["Client Name", "Trello Comments"],
            filterByFormula: "FIND('" + trelloCard.name + "',{Client Name}) = 1",
            pageSize: PAGE_SIZE
        }).eachPage(function page(records, fetchNextPage) {
            debug("Received %d records", records.length);
            pageHandler(records);
            if (records.length >= PAGE_SIZE) {
                fetchNextPage();
            }
        }, doneHandler);
    };

    this.updateClient = function(recordId, trelloComments) {
        debug("Updating record id %s", recordId);
        if (recordId.length > 0) {
            base('Cases as of 6/13/19').update(recordId, {
                "Last Worked On": new Date().toISOString(),
                "Trello Comments": trelloComments
            });
        }
    };
};
