"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var net_1 = require("net");
var uuidv4 = require("uuid/v4");
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Unknown"] = 0] = "Unknown";
    MessageType["Response"] = "Response";
    MessageType["Event"] = "Event";
})(MessageType || (MessageType = {}));
var Actions;
(function (Actions) {
    Actions["Bridge"] = "Bridge";
    Actions["Login"] = "Login";
    Actions["Logoff"] = "Logoff";
    Actions["Originate"] = "Originate";
})(Actions || (Actions = {}));
var Events;
(function (Events) {
    Events["FullyBooted"] = "FullyBooted";
})(Events = exports.Events || (exports.Events = {}));
var Tones;
(function (Tones) {
    Tones["no"] = "no";
    Tones["Channel1"] = "Channel1";
    Tones["Channel2"] = "Channel2";
    Tones["Both"] = "Both";
})(Tones = exports.Tones || (exports.Tones = {}));
var LINE_DELIMITER = "\r\n";
var PACKET_DELIMITER = LINE_DELIMITER + LINE_DELIMITER;
var AsteriskManagerInterface = /** @class */ (function (_super) {
    __extends(AsteriskManagerInterface, _super);
    function AsteriskManagerInterface() {
        var _this = _super.call(this) || this;
        _this.buffer = "";
        _this.on("data", _this.dataEventHandler);
        return _this;
    }
    AsteriskManagerInterface.prototype.formatRawMessage = function (action, headers) {
        var rawMessage = "Action: " + action;
        for (var header in headers) {
            if (Object.prototype.toString.call(headers[header]) === "[object Object]") {
                for (var key in headers[header]) {
                    rawMessage += "" + LINE_DELIMITER + header + ": " + key + "=" + headers[header][key];
                }
            }
            else {
                rawMessage += "" + LINE_DELIMITER + header + ": " + headers[header];
            }
        }
        ;
        return "" + rawMessage + PACKET_DELIMITER;
    };
    AsteriskManagerInterface.prototype.parseMessage = function (rawMessage) {
        var message = {
            type: MessageType.Unknown,
            name: "",
            headers: {}
        };
        var headers = rawMessage.split(LINE_DELIMITER);
        if (headers[0].startsWith("Asterisk Call Manager")) {
            var banner = headers.shift();
        }
        for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
            var header = headers_1[_i];
            var tag = header.split(": ");
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
    };
    AsteriskManagerInterface.prototype.dataEventHandler = function (data) {
        this.buffer += data.toString();
        if (this.buffer.endsWith(PACKET_DELIMITER)) {
            var messages = this.buffer.split(PACKET_DELIMITER);
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var rawMessage = messages_1[_i];
                if (rawMessage == "") {
                    continue;
                }
                var message = this.parseMessage(rawMessage);
                switch (message.type) {
                    case MessageType.Response:
                        var actionId = message.headers.ActionID;
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
    };
    AsteriskManagerInterface.prototype.sendAction = function (action, headers, handler) {
        if (!headers.ActionID) {
            headers.ActionID = uuidv4();
        }
        if (handler) {
            this.once(headers.ActionID, handler);
        }
        return this.write(this.formatRawMessage(action, headers));
    };
    AsteriskManagerInterface.prototype.bridge = function (headers, handler) {
        return this.sendAction(Actions.Bridge, headers, handler);
    };
    AsteriskManagerInterface.prototype.login = function (headers, handler) {
        return this.sendAction(Actions.Login, headers, handler);
    };
    AsteriskManagerInterface.prototype.logoff = function (handler) {
        return this.sendAction(Actions.Logoff, {}, handler);
    };
    AsteriskManagerInterface.prototype.originate = function (headers, handler) {
        return this.sendAction(Actions.Originate, headers, handler);
    };
    return AsteriskManagerInterface;
}(net_1.Socket));
exports.AsteriskManagerInterface = AsteriskManagerInterface;
