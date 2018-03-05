import {
    AsteriskManagerInterface as AMI,
    Tones
} from "..";

beforeAll(() => {
    this.asterisk = new AMI;
    this.asterisk.write = jest.fn();
});

beforeEach(() => {
    this.asterisk.write.mockClear();
});

test("call bridge function with all complete headers fields", () => {
    this.asterisk.bridge({
        ActionID: "1234567890",
        Channel1: "PJSIP/1001",
        Channel2: "PJSIP/1002",
        Tone: Tones.Both
    });

    expect(this.asterisk.write.mock.calls[0][0]).toBe("Action: Bridge\r\n\
ActionID: 1234567890\r\n\
Channel1: PJSIP/1001\r\n\
Channel2: PJSIP/1002\r\n\
Tone: Both\r\n\r\n");
});
