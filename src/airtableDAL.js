const airtable = require('airtable');
const config = require('config');
const debug = require('debug')('trello-to-airtable-syncer:airtable');

const PAGE_SIZE = 100;
const base = new airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);

module.exports = function AirtableDAL() {
    this.selectClientsByNamePrefix = function(trelloCard) {
        debug("Searching for client '%s'", trelloCard.name);
        return base(config.airtable.tableName).select({
            fields: ["Client Name", "Trello Comments"],
            filterByFormula: "FIND('" + trelloCard.name + "',{Client Name}) = 1",
            pageSize: PAGE_SIZE
        }).all();
    };

    this.updateClient = function(recordId, trelloComments) {
        debug("Updating record id %s", recordId);
        // TODO: Handle whatever errors Airtable updates may encounter
        if (recordId.length > 0) {
            base(config.airtable.tableName).update(recordId, {
                "Last Worked On": new Date().toISOString(),
                "Trello Comments": trelloComments
            });
        }
    };
};
