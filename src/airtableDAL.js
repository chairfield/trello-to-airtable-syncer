const airtable = require('airtable');
const config = require('config');
const debug = require('debug')('trello-to-airtable-syncer:airtable');

const PAGE_SIZE = 100;
const base = new airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);

module.exports = function AirtableDAL() {
    this.selectClientsByNamePrefix = function(pageHandler, doneHandler) {
        base('Cases as of 6/13/19').select({
            // TODO: Only select the fields that I need
            // TODO: Make this a prefix search only
            filterByFormula: "FIND(" + "'Torres'" + ",{Client Name})>=1",
            pageSize: PAGE_SIZE
        }).eachPage(function page(records, fetchNextPage) {
            debug("Received %d records", records.length);
            pageHandler(records);
            if (records.length >= PAGE_SIZE) {
                fetchNextPage();
            }
        }, doneHandler);
    };
};
