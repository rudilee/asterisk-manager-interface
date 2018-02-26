import {Socket} from "net";

import uuidv4 = require("uuid/v4");

enum MessageType {
    Response = "Response",
    Event = "Event"
}

enum Actions {
    Login = "Login"
}

interface Message {
    type: MessageType;
    response?: string;
    event?: string;
    headers: any;
}

interface LoginHeaders {
    Username: string;
    Secret: string;
}

export class AsteriskManagerInterface extends Socket {
    constructor() {
        super();

        this.on("data", this.dataEventHandler);
    }

    private formatRawMessage(action: string, headers: any): string {
        let rawMessage = `Action: ${action}`;
        
        for (let header in headers) {
            rawMessage += `\r\n${header}: ${headers[header]}`;
        };

        return `${rawMessage}\r\n\r\n`;
    }

    private parseMessage(rawMessage: string): Message {
        let message: Message;
        let headers = rawMessage.split("\r\n");

        for (const header of headers) {
            let tag = header.split(": ");

            switch (tag[0]) {
                case MessageType.Response:
                    message = {
                        type: MessageType.Response,
                        response: tag[1],
                        headers: {}
                    };
                    break;

                case MessageType.Event:
                    message = {
                        type: MessageType.Event,
                        event: tag[1],
                        headers: {}
                    };
                    break;
            
                default:
                    message.headers[tag[0]] = tag[1];
                    break;
            }
        }

        return message;
    }

    private dataEventHandler(data: Buffer) {
        let messages = data.toString().split("\r\n\r\n");

        if (messages[0].startsWith("Asterisk Call Manager")) {
            let banner = messages.shift();
        }
        
        for (const rawMessage of messages) {
            if (rawMessage == "") {
                continue;
            }

            let message = this.parseMessage(rawMessage);

            switch (message.type) {
                case MessageType.Response:
                    let actionId = message.headers.ActionID;
                    delete message.headers.ActionID;

                    this.emit(actionId, message.response, message.headers);
                    break;

                case MessageType.Event:
                    this.emit(message.event, message.headers);
                    break;
            }
        }
    }

    private sendAction(action: string, headers: any, handler: (response: string, headers: any) => void): boolean {
        headers.ActionID = uuidv4();

        this.once(headers.ActionID, handler);

        return this.write(this.formatRawMessage(action, headers));
    }

    public login(headers: LoginHeaders, handler: (response: string, headers: any) => void): boolean {
        return this.sendAction(Actions.Login, headers, handler);
    }
}