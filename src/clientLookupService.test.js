const ClientLookupService = require('./clientLookupService');

describe("ClientLookupService -> filtering records to a match", () => {
    test("When it is passed 0 records, an error is thrown", () => {
        expect(() => {
            new ClientLookupService()._filterMatch([]);
        }).toThrow("No records returned.");
    });
});
