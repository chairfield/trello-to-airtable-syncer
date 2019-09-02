const ClientLookupService = require('./clientLookupService');

class Record {
    constructor(id, clientName, submissionDate) {
        this._id = id;
        this._clientName = clientName;
        this._submissionDate = submissionDate;
    }

    get id() {
        return this._id;
    }

    get(fieldName) {
        if (fieldName === 'Client Name') {
            return this._clientName;
        } else if (fieldName === 'Submission date [new]') {
            return this._submissionDate;
        } else {
            throw new Error('Unsupported field name');
        }
    }
}

describe('ClientLookupService -> filtering records to a match', () => {
    test('When passed 0 records, an error is thrown', () => {
        expect(() => {
            new ClientLookupService()._filterMatch([]);
        }).toThrow('FilterMatch called with 0 records.');
    });

    test('When passed more than 20 records, an error is thrown with the names of all records', () => {
        const record = new Record(123, 'a');
        let records = [];
        for (let i = 0; i < 21; i++) {
            records.push(record);
        }

        expect(() => {
            new ClientLookupService()._filterMatch(records);
        }).toThrow('21 records returned: a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a');
    });

    test('When passed 1 record, that record is returned', () => {
        const record = new Record(123, 'Joe');
        const result = new ClientLookupService()._filterMatch([record]);
        expect(result).toBe(record);
    });

    test('When multiple records contain different names, an error is thrown', () => {
        const records = [
            new Record(123, 'Joe Walsh'),
            new Record(234, 'Joe Walsher')
        ];
        expect(() => {
            new ClientLookupService()._filterMatch(records);
        }).toThrow('Not all Client Names matched: Joe Walsh,Joe Walsher');
    });

    test('When multiple records for the name client, return the newest', () => {
        const records = [
            new Record(123, 'Joe Walsh', '2017-03-17T01:01:01.000Z'),
            new Record(234, 'Joe Walsh', '2019-08-29T01:01:01.000Z')
        ];
        const result = new ClientLookupService()._filterMatch(records);
        expect(result).toBe(records[1]);
    });
});
