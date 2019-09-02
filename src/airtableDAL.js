const airtable = require('airtable');
const config = require('config');
const winston = require('../config/winston');
const AirtableFields = require('./airtableFields');

const PAGE_SIZE = 100;
const base = new airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);

module.exports = function AirtableDAL() {
    this.selectClientsByNamePrefix = function(trelloCard) {
        winston.info('Searching for client: ' + trelloCard.name);
        return base(config.airtable.tableName).select({
            fields: [AirtableFields.CLIENT_NAME, AirtableFields.TRELLO_COMMENTS, AirtableFields.SUBMISSION_DATE],
            // This performs a prefix search on all records in the Airtable. For instance, searching for "Joe Walsh"
            // will match "Joe Walsh", but also "Joe Walsher". It is up to the ClientLookupService to interpret the
            // results appropriately.
            filterByFormula: 'FIND(\'' + trelloCard.name + '\',{Client Name}) = 1',
            pageSize: PAGE_SIZE // This may not be useful now that we're calling .all() instead of .firstPage()
        }).all(); // The .all() method paginates for us, returning all matching records from Airtable
    };

    this.updateClient = function(recordId, trelloComments) {
        winston.info('Updating record id: ' + recordId);
        if (recordId.length === 0) {
            throw new Error('Empty recordId, cannot update with comment: ' + trelloComments);
        }

        let fields = {};
        fields[AirtableFields.LAST_WORKED_ON] = new Date().toISOString();
        fields[AirtableFields.TRELLO_COMMENTS] = trelloComments;
        return base(config.airtable.tableName).update(recordId, fields);
    };
};
