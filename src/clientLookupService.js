const winston = require('../config/winston');
const AirtableDAL = require('./airtableDAL');
const AirtableFields = require('./airtableFields');

module.exports = function ClientLookupService() {
    this.findMatchingClient = async function(trelloCard) {
        const records = await new AirtableDAL().selectClientsByNamePrefix(trelloCard);
        return this._filterMatch(records);
    };

    this._filterMatch = function(records) {
        records.forEach(function(record) {
            winston.info('Retrieved record: ' + record.get(AirtableFields.CLIENT_NAME) + ', id: ' + record.id);
        });

        const recordNames = records.map(record => record.get(AirtableFields.CLIENT_NAME));
        this._validateRecords(recordNames);
        const recordsByDateMap =
            records.map(record => [ Date.parse(record.get(AirtableFields.SUBMISSION_DATE)), record ]);
        const reduceToMostRecent = (previous, current) => current[0] > previous[0] ? current : previous;
        return recordsByDateMap.reduce(reduceToMostRecent)[1];
    };

    this._validateRecords = function(recordNames) {
        function createDebugString(recordNames) {
            return recordNames.join(',').slice(0, 200);
        }

        const recordCount = recordNames.length;
        if (recordCount === 0) {
            throw new Error('FilterMatch called with 0 records.');
        } else if (recordCount > 20) {
            // Too many records indicates an overly-permissive Airtable select query.
            throw new Error(recordCount + ' records returned: ' + createDebugString(recordNames));
        } else if (recordNames.some(name => name !== recordNames[0])) {
            throw new Error('Not all Client Names matched: ' + createDebugString(recordNames));
        }
    }
};
