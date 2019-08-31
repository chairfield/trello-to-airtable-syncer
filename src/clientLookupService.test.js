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
        }).toThrow("No records returned.");
    });

    test("When passed 1 record, that record is returned", () => {
        const record = new Record(123, "Joe");
        const result = new ClientLookupService()._filterMatch([record]);
        expect(result).toBe(record);
    });
});
