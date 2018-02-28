import {Socket} from "net";

import uuidv4 = require("uuid/v4");

enum MessageType {
    Unknown,
    Response = "Response",
    Event = "Event"
}

enum Actions {
    Login = "Login",
    Logoff = "Logoff",
    Originate = "Originate"
}

export enum Events {
    FullyBooted = "FullyBooted"
}

interface Message {
    type: MessageType;
    name: string;
    headers: any;
}

interface Headers {
    ActionID?: string
}

interface LoginHeaders extends Headers {
    Username: string;
    Secret: string;
}

interface OriginateHeaders extends Headers {
    Channel: string,
    Exten?: string,
    Context?: string,
    Priority?: number,
    Application?: string,
    Data?: string,
    Timeout?: number,
    CallerID?: string,
    Variable?: string,
    Account?: string,
    EarlyMedia?: boolean,
    Async?: boolean,
    Codecs?: string,
    ChannelId?: string,
    OtherChannelId?: string
}

const LINE_DELIMITER = "\r\n";
const PACKET_DELIMITER = LINE_DELIMITER + LINE_DELIMITER;

export class AsteriskManagerInterface extends Socket {
    private buffer: string = "";

    constructor() {
        super();

        this.on("data", this.dataEventHandler);
    }

    private formatRawMessage(action: string, headers: any): string {
        let rawMessage = `Action: ${action}`;
        
        for (let header in headers) {
            rawMessage += `${LINE_DELIMITER}${header}: ${headers[header]}`;
        };

        return `${rawMessage}${PACKET_DELIMITER}`;
    }

    private parseMessage(rawMessage: string): Message {
        let message: Message = {
            type: MessageType.Unknown,
            name: "",
            headers: {}
        };

        let headers = rawMessage.split(LINE_DELIMITER);

        if (headers[0].startsWith("Asterisk Call Manager")) {
            let banner = headers.shift();
        }
        
        for (const header of headers) {
            let tag = header.split(": ");

            switch (tag[0]) {
                case MessageType.Response:
                    message.type = MessageType.Response;
                    message.name = tag[1];
                    break;

                case MessageType.Event:
                    message.type = MessageType.Event;
                    message.name = tag[1];
                    break;
            
                default:
                    message.headers[tag[0]] = tag[1];
                    break;
            }
        }

        return message;
    }

    private dataEventHandler(data: Buffer) {
        this.buffer += data.toString();

        if (this.buffer.endsWith(PACKET_DELIMITER)) {
            let messages = this.buffer.split(PACKET_DELIMITER);
    
            for (const rawMessage of messages) {
                if (rawMessage == "") {
                    continue;
                }
    
                let message = this.parseMessage(rawMessage);
    
                switch (message.type) {
                    case MessageType.Response:
                        let actionId = message.headers.ActionID;
                        delete message.headers.ActionID;
    
                        this.emit(actionId, message.name, message.headers);
                        break;
    
                    case MessageType.Event:
                        this.emit(message.name, message.headers);
                        break;
                }
            }

            this.buffer = "";
        }
    }

    private sendAction(action: string, headers: any, handler?: (response: string, headers: any) => void): boolean {
        if (!headers.ActionID) {
            headers.ActionID = uuidv4();
        }

        if (handler) {
            this.once(headers.ActionID, handler);
        }

        return this.write(this.formatRawMessage(action, headers));
    }

    public login(headers: LoginHeaders, handler: (response: string, headers: any) => void): boolean {
        return this.sendAction(Actions.Login, headers, handler);
    }

    public logoff(handler?: (response: string, headers: any) => void): boolean {
        return this.sendAction(Actions.Logoff, {}, handler);
    }

    public originate(headers: OriginateHeaders, handler?: (response: string, headers: any) => void): boolean {
        return this.sendAction(Actions.Originate, headers, handler);
    }
}