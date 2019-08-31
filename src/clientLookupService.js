const debug = require('debug')('trello-to-airtable-syncer:clientLookupService');
const AirtableDAL = require('./airtableDAL');

module.exports = function ClientLookupService() {
    const CLIENT_NAME = 'Client Name';
    const SUBMISSION_DATE = 'Submission date [new]';

    this.findMatchingClient = async function(trelloCard) {
        const records = await new AirtableDAL().selectClientsByNamePrefix(trelloCard);
        return this._filterMatch(records);
    };

    this._filterMatch = function(records) {
        records.forEach(function(record) {
            debug('Retrieved record: %s, id: %s', record.get(CLIENT_NAME), record.id);
        });

        if (records.length === 0 || records.length > 20) {
            throw new Error(records.length + ' records returned.');
        }

        const recordNames = records.map(record => record.get(CLIENT_NAME));
        if (recordNames.some(name => name !== recordNames[0])) {
            throw new Error('Not all Client Names matched.');
        }

        // TODO: Email a warning (not an error) if there are 2+ records submitted around the same time, as this could be
        //  the same client input twice.

        const recordsByDateMap = records.map(record => [Date.parse(record.get(SUBMISSION_DATE)), record]);
        const reduceToMostRecent = (previous, current) => current[0] > previous[0] ? current : previous;
        return recordsByDateMap.reduce(reduceToMostRecent)[1];
    };
};
