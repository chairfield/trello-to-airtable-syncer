const ClientLookupService = require('./clientLookupService');

class Record {
    constructor(id, clientName) {
        this._id = id;
        this._clientName = clientName;
    }

    get id() {
        return this._id;
    }

    get(fieldName) {
        if (fieldName === "Client Name") {
            return this._clientName;
        } else {
            throw new Error("Unsupported");
        }
    }
}

describe("ClientLookupService -> filtering records to a match", () => {
    test("When passed 0 records, an error is thrown", () => {
        expect(() => {
            new ClientLookupService()._filterMatch([]);
        }).toThrow("0 records returned.");
    });

    test("When passed more than 20 records, an error is thrown", () => {
        const record = new Record(123, "Joe");
        let records = [];
        for (let i = 0; i < 21; i++) {
            records.push(record);
        }

        expect(() => {
            new ClientLookupService()._filterMatch(records);
        }).toThrow("21 records returned.");
    });

    test("When passed 1 record, that record is returned", () => {
        const record = new Record(123, "Joe");
        const result = new ClientLookupService()._filterMatch([record]);
        expect(result).toBe(record);
    });

    test("When multiple records contain different names, an error is thrown", () => {
        const records = [
            new Record(123, "Joe Walsh"),
            new Record(234, "Joe Walsher")
        ];
        expect(() => {
            new ClientLookupService()._filterMatch(records);
        }).toThrow("Not all Client Names matched.");
    });
});
