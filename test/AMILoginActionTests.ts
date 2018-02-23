import {AsteriskManagerInterface as AMI} from "..";

test("send Login action with correct credentials get Success response from AMI", done => {
    let asterisk = new AMI;

    asterisk.connect(5038, "192.168.99.128", () => {
        asterisk.login({
            Username: "test",
            Secret: "12345"
        }, (response, headers) => {
            expect(response).toBe("Success");
            done();
        });
    });
});
