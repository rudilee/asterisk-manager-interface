import {AsteriskManagerInterface as AMI} from "..";

beforeEach(() => {
    this.asterisk = new AMI;
});

afterEach(() => {
    this.asterisk.end();
});

test("send Logoff action after login get Goodbye response from AMI", done => {
    this.asterisk.connect(5038, "localhost", () => {
        this.asterisk.logoff((response, headers) => {
            expect(response).toBe("Goodbye");
            done();
        });
    });
});
