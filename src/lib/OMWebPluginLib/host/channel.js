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
var OMWebPluginLib;
(function (OMWebPluginLib) {
    var Host;
    (function (Host) {
        var ChannelInitError = 'Plugin channel cannot be initialised: ';
        var newRequestId = (function () {
            var _seqRequestId = 0;
            return function () { return ++_seqRequestId; };
        })();
        /** Return new channel or null if type not
         * @param channel
         */
        function channelFactory(channel, onNotify) {
            if (!channel) {
                throw new Error(ChannelInitError + 'Empty channel type');
            }
            switch (channel) {
                case OMWebPluginLib.UrlParams.WebParentChannel:
                    return new ParentChannel(onNotify);
                case OMWebPluginLib.UrlParams.WebOpenerChannel:
                    return new OpenerChannel(onNotify);
                case OMWebPluginLib.UrlParams.CefChannel:
                    return new CefChannel(onNotify);
            }
            throw new Error(ChannelInitError + ("Unknown channel type '" + channel + "'"));
        }
        Host.channelFactory = channelFactory;
        /** Base channel implementation for plugins hosted in a web app.
         * Uses postMessage as a communication channel.
         */
        var WindowChannel = /** @class */ (function () {
            function WindowChannel(target, onNotify) {
                var _this = this;
                this._queue = [];
                this.onMessage = function (e) {
                    if (e.source !== _this._target)
                        return;
                    var raw = e.data;
                    if (!OMWebPluginLib.Message.isRawMessage(raw))
                        return;
                    _this.processIncoming(raw);
                };
                if (!target) {
                    throw new Error(ChannelInitError + 'Missing reference to a client window object');
                }
                else if (target === window) {
                    throw new Error(ChannelInitError + 'Plugin window object and client window object are the same');
                }
                this._target = target;
                this._onNotify = onNotify;
                window.addEventListener('message', this.onMessage);
            }
            WindowChannel.prototype.close = function () {
                window.removeEventListener('message', this.onMessage);
            };
            /** Sends a notification message. A notification is only one way call.
             * The paramter could also be a generic IMessage in the future.
             */
            WindowChannel.prototype.postMessage = function (msg) {
                var raw = {
                    protocol: OMWebPluginLib.Message.Protocol,
                    version: OMWebPluginLib.Message.Version,
                    payload: msg
                };
                this.processOutgoing(raw);
            };
            /**
             * Sends a request message. For every request message one response message is expected to be received.
             * @param msg
             */
            WindowChannel.prototype.sendRequest = function (msg) {
                var requestId = newRequestId();
                var raw = {
                    protocol: OMWebPluginLib.Message.Protocol,
                    version: OMWebPluginLib.Message.Version,
                    requestId: requestId,
                    payload: msg
                };
                //construct 'pending' object to be able to map incoming response message to a promise
                var pending = null;
                var p = new Promise(function (resolve, reject) {
                    pending = {
                        requestId: requestId,
                        resolve: resolve,
                        reject: reject
                    };
                });
                this.processOutgoing(raw, pending);
                return p;
            };
            WindowChannel.prototype.processOutgoing = function (raw, pending) {
                if (!!this._pending) {
                    this.enqueue(raw, true, pending);
                    return;
                }
                this._pending = pending;
                this._target.postMessage(raw, '*'); //TODO DEBUG proper target origin
            };
            WindowChannel.prototype.processIncoming = function (raw) {
                if (OMWebPluginLib.Message.isRequest(raw)) {
                    OMWebPluginLib.throwNotImplemented();
                }
                else if (OMWebPluginLib.Message.isResponse(raw)) {
                    this.onResponse(raw); //process response directly
                }
                else {
                    if (!!this._pending) {
                        this.enqueue(raw, false);
                        return;
                    }
                    var rawPayload = raw.payload;
                    if (OMWebPluginLib.Message.isMessage(rawPayload)) {
                        this._onNotify && this._onNotify(rawPayload);
                    }
                    else {
                        OMWebPluginLib.Log.warn('Notify message ignored', rawPayload);
                    }
                }
            };
            WindowChannel.prototype.onResponse = function (rawRes) {
                var rawPayload = rawRes.payload;
                if (!!this._pending && rawRes.responseId === this._pending.requestId) {
                    var pending = this._pending;
                    this._pending = null;
                    if (rawRes.isError) {
                        pending.reject(rawPayload);
                    }
                    else if (OMWebPluginLib.Message.isMessage(rawPayload)) {
                        pending.resolve(rawPayload);
                    }
                    else {
                        OMWebPluginLib.Log.error('Invalid response message', rawPayload);
                    }
                    this.processMessageQueue();
                }
                else {
                    OMWebPluginLib.Log.error('Unexpected response message or response after timeout', rawPayload);
                }
            };
            WindowChannel.prototype.enqueue = function (raw, isOutgoing, pending) {
                var item = {
                    raw: raw,
                    isOutgoing: isOutgoing,
                    pending: pending
                };
                this._queue.push(item);
            };
            WindowChannel.prototype.processMessageQueue = function () {
                while (!this._pending && this._queue.length > 0) {
                    var item = this._queue.splice(0, 1)[0];
                    if (item.isOutgoing) {
                        this.processOutgoing(item.raw, item.pending);
                    }
                    else {
                        this.processIncoming(item.raw);
                    }
                }
            };
            return WindowChannel;
        }());
        /** Channel for plugins running in an iframe
         */
        var ParentChannel = /** @class */ (function (_super) {
            __extends(ParentChannel, _super);
            function ParentChannel(onNotify) {
                return _super.call(this, window.parent, onNotify) || this;
            }
            return ParentChannel;
        }(WindowChannel));
        /** Channel for plugins running in a new tab
         */
        var OpenerChannel = /** @class */ (function (_super) {
            __extends(OpenerChannel, _super);
            function OpenerChannel(onNotify) {
                return _super.call(this, window.opener, onNotify) || this;
            }
            return OpenerChannel;
        }(WindowChannel));
        /** Channel implementation for plugins hosted
         * in a client app in a cefsharp browser engine.
         * The client app registers an object which proxy instance with public methods
         * is available in JS.
         *
         * Unlike window channel requests are not wrapped as raw messages but passed directly in the call to external proxy.
         * Returning promise is used pass response.
         * Only one worker thread (not main UI thread) is used in cefsharp for external calls so further internal synchronization of calls is not required.
         */
        var CefChannel = /** @class */ (function () {
            function CefChannel(onNotify) {
                var _this = this;
                this.onMessage = function (e) {
                    if (e.source !== window)
                        return;
                    var msg = e.data; //JS message object is passed directly
                    if (!OMWebPluginLib.Message.isMessage(msg))
                        return;
                    _this._onNotify && _this._onNotify(msg);
                };
                this._onNotify = onNotify;
                window.addEventListener('message', this.onMessage);
            }
            CefChannel.prototype.close = function () {
                window.removeEventListener('message', this.onMessage);
            };
            CefChannel.prototype.postMessage = function (msg) {
                external.onNotify(JSON.stringify(msg));
            };
            CefChannel.prototype.sendRequest = function (msg) {
                var p = new Promise(function (resolve, reject) {
                    external.onRequest(JSON.stringify(msg)).then(function (json) {
                        if (!json)
                            reject('Empty response from client');
                        try {
                            var msg_1 = JSON.parse(json);
                            if (typeof msg_1 === 'object' && OMWebPluginLib.Message.isMessage(msg_1)) {
                                resolve(msg_1);
                            }
                            else
                                reject('Invalid response object from client');
                        }
                        catch (e) {
                            reject('Invalid response format from client');
                        }
                    }, function (reason) {
                        if (typeof reason === 'string') {
                            var error_1 = CefChannel.tryParseError(reason);
                            if (!!error_1) {
                                reject(error_1);
                                return;
                            }
                        }
                        var error = { message: String(reason) };
                        reject(error);
                    });
                });
                return p;
            };
            /** When external handler throws then the .net exception is serialized to a string passed as a rejection reason to the promise.
             * IError object should be encoded as a json in the message property as [[{ IError object json string }]]
             * Json begins with [[ and ends with ]].
             * Example: [[{"message":"Invalid parameter"}]]
             * @param reason exception formatted by cefsharp
             */
            CefChannel.tryParseError = function (reason) {
                var jsonStart = reason.indexOf('[[{');
                if (jsonStart < 0)
                    return null;
                var jsonEnd = reason.indexOf('}]]');
                if (jsonEnd < 0)
                    return null;
                var json = reason.substring(jsonStart + 2 /*2 squre brackets*/, jsonEnd + 1 /*curly bracket*/);
                try {
                    var error = JSON.parse(json);
                    if (OMWebPluginLib.Message.isError(error))
                        return error;
                }
                catch (_a) { }
                return null;
            };
            return CefChannel;
        }());
    })(Host = OMWebPluginLib.Host || (OMWebPluginLib.Host = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=channel.js.map