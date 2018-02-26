import {AsteriskManagerInterface as AMI} from "..";

beforeEach(() => {
    this.asterisk = new AMI;
});

afterEach(() => {
    this.asterisk.end();
});

test("send Logoff action after login get Goodbye response from AMI", done => {
    this.asterisk.connect(5038, "192.168.99.128", () => {
        this.asterisk.login({
            Username: "test",
            Secret: "12345"
        }, (response, headers) => {
            this.asterisk.logoff((response, headers) => {
                expect(response).toBe("Goodbye");
                done();
            });
        });
    });
});
