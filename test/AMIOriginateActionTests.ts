import {AsteriskManagerInterface as AMI} from "..";

beforeAll(() => {
    this.asterisk = new AMI;
    this.asterisk.write = jest.fn();
});

beforeEach(() => {
    this.asterisk.write.mockClear();
});

test("call originate function with only required headers fields", () => {
    this.asterisk.originate({
        ActionID: "1234567890",
        Channel: "PJSIP/1234"
    });

    expect(this.asterisk.write.mock.calls[0][0]).toBe("Action: Originate\r\n\
ActionID: 1234567890\r\n\
Channel: PJSIP/1234\r\n\r\n");
});

test("call originate function with all complete headers fields", () => {
    this.asterisk.originate({
        ActionID: "1234567890",
        Channel: "PJSIP/1234",
        Exten: "12345",
        Context: "default",
        Priority: 1,
        Application: "Playback",
        Data: "tt-monkeys",
        Timeout: 1000,
        CallerID: "1234",
        Variable: "FOO=BAR",
        Account: "DOCUMENTATION",
        EarlyMedia: true,
        Async: true,
        Codecs: "ulaw,alaw",
        ChannelId: "1234567890.123",
        OtherChannelId: "1234567890.123"
    });

    expect(this.asterisk.write.mock.calls[0][0]).toBe("Action: Originate\r\n\
ActionID: 1234567890\r\n\
Channel: PJSIP/1234\r\n\
Exten: 12345\r\n\
Context: default\r\n\
Priority: 1\r\n\
Application: Playback\r\n\
Data: tt-monkeys\r\n\
Timeout: 1000\r\n\
CallerID: 1234\r\n\
Variable: FOO=BAR\r\n\
Account: DOCUMENTATION\r\n\
EarlyMedia: true\r\n\
Async: true\r\n\
Codecs: ulaw,alaw\r\n\
ChannelId: 1234567890.123\r\n\
OtherChannelId: 1234567890.123\r\n\r\n");
});
