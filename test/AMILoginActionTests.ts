import {AsteriskManagerInterface as AMI} from "..";

beforeEach(() => {
    this.asterisk = new AMI;
});

afterEach(() => {
    this.asterisk.end();
});

test("send Login action with correct credentials get Success response from AMI", done => {
    this.asterisk.connect(5038, "192.168.99.128", () => {
        this.asterisk.login({
            Username: "test",
            Secret: "12345"
        }, (response, headers) => {
            expect(response).toBe("Success");
            done();
        });
    });
});

test("send Login action with incorrect credentials get Error response from AMI", done => {
    this.asterisk.connect(5038, "192.168.99.128", () => {
        this.asterisk.login({
            Username: "tests",
            Secret: "123456"
        }, (response, headers) => {
            expect(response).toBe("Error");
            done();
        });
    });
});
