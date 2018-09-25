"use strict";
var OMWebPluginLib;
(function (OMWebPluginLib) {
    function throwNotImplemented() {
        throw new Error('not implemented');
    }
    OMWebPluginLib.throwNotImplemented = throwNotImplemented;
    var Log;
    (function (Log) {
        function warn(message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            console.warn(format([message].concat(args)));
        }
        Log.warn = warn;
        function error(message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            console.error(format([message].concat(args)));
        }
        Log.error = error;
        function info(message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            console.info(format([message].concat(args)));
        }
        Log.info = info;
        function format() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var formatted = args.map(function (x) { return String(x); }).join(' ,');
            return "OMWebPluginLib: " + formatted;
        }
    })(Log = OMWebPluginLib.Log || (OMWebPluginLib.Log = {}));
    //export type StringKeyValueMap<T> = { [key: string]: T }
    //export type NumberKeyValueMap<T> = { [key: number]: T }
    //export type ReadonlyStringKeyValueMap<T> = { readonly [key: string]: T }
    //export type ReadonlyNumberKeyValueMap<T> = { readonly [key: number]: T }
    var UrlParams;
    (function (UrlParams) {
        UrlParams.Channel = "channel";
        UrlParams.PluginConfig = "pluginconfig";
        UrlParams.WebParentChannel = "parent"; //web post message
        UrlParams.WebOpenerChannel = "opener"; //web post message
        UrlParams.CefChannel = "cef"; //win client native
    })(UrlParams = OMWebPluginLib.UrlParams || (OMWebPluginLib.UrlParams = {}));
    var Message;
    (function (Message) {
        Message.Protocol = "omwebplugin"; // identifies webplugin communication protocol
        Message.Version = 1; // current version
        function isRawMessage(msg) {
            var m = msg;
            return typeof m === 'object' && m.protocol === Message.Protocol && typeof m.version === 'number' &&
                m.version >= Message.Version && typeof m.payload === 'object';
        }
        Message.isRawMessage = isRawMessage;
        function isRequest(msg) {
            var m = msg;
            return typeof m.requestId === 'number';
        }
        Message.isRequest = isRequest;
        function isResponse(msg) {
            var m = msg;
            return typeof m.responseId === 'number';
        }
        Message.isResponse = isResponse;
        function isMessage(rawPayload) {
            var p = rawPayload;
            return typeof p === 'object' && typeof p.module === 'string' && typeof p.type === 'string';
        }
        Message.isMessage = isMessage;
        function isError(reason) {
            var e = reason;
            return typeof e === 'object' && typeof e.message === 'string' && !!e.message;
        }
        Message.isError = isError;
    })(Message = OMWebPluginLib.Message || (OMWebPluginLib.Message = {}));
    /** Defines common notification messages
     */
    var Notify;
    (function (Notify) {
        //| 'flashnotes' | 'workflows'
        var Lifecycle;
        (function (Lifecycle) {
            Lifecycle.Module = 'lifecycle';
            //sent to client after plugin successfully created (sent in next tick)
            Lifecycle.Ready = 'ready';
        })(Lifecycle = Notify.Lifecycle || (Notify.Lifecycle = {}));
        var View;
        (function (View) {
            View.Module = 'view';
            //scrollWidth and scrollHeight
            View.ContentSize = 'contentsize';
        })(View = Notify.View || (Notify.View = {}));
        var Board;
        (function (Board) {
            Board.Module = 'board';
            Board.SetWidgetConfig = 'setWidgetConfig';
            Board.SetFederatedSearch = 'setFederatedSearch';
        })(Board = Notify.Board || (Notify.Board = {}));
        var UserAction;
        (function (UserAction) {
            UserAction.Module = 'useraction';
            UserAction.OK = 'ok';
            UserAction.Cancel = 'cancel';
        })(UserAction = Notify.UserAction || (Notify.UserAction = {}));
        var Document;
        (function (Document) {
            Document.Module = 'document';
            Document.SetCurrentDocument = 'setCurrentDocument';
        })(Document = Notify.Document || (Notify.Document = {}));
        function parsePayload(msg) {
            var json = msg.json;
            if (!json || typeof json !== 'string')
                return null;
            var p = JSON.parse(json);
            return typeof p === 'object' ? p : null;
        }
        Notify.parsePayload = parsePayload;
        //export interface RawNotifyMessage extends Message.IRawPayloadMessage<NotifyMessage> {
        //    readonly kind: Message.RawMessageKind.notify;
        //}
        //export function createRawNotifyMessage(payload: NotifyMessage): RawNotifyMessage {
        //    return {
        //        kind: Message.RawMessageKind.notify,
        //        protocol: Message.Protocol,
        //        version: Message.Version,
        //        payload
        //    }
        //}
        //export function isRawNotify(arg: any): arg is RawNotifyMessage {
        //    return Message.isRawNotify(arg) &&
        //        arg.kind === Message.RawMessageKind.notify &&
        //        !!arg.payload
        //}
    })(Notify = OMWebPluginLib.Notify || (OMWebPluginLib.Notify = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=index.js.map