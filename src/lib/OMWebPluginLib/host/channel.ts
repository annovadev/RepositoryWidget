namespace OMWebPluginLib {
    export namespace Host {
        const ChannelInitError = 'Plugin channel cannot be initialised: '

        const newRequestId = (function () {
            let _seqRequestId: number = 0;
            return () => ++_seqRequestId
        })()

        export interface IChannel {
            close();
            postMessage(msg: Message.IMessage);
            sendRequest(msg: Message.IMessage): Promise<Message.IMessage>;
        }

        type Pending = {
            requestId: number;
            resolve: (msg: Message.IMessage) => void;
            reject: (reason: any) => void;
        }

        type QueueItem = {
            raw: Message.IRawMessage;
            isOutgoing: boolean;
            pending?: Pending;
        }

        /** Return new channel or null if type not
         * @param channel
         */
        export function channelFactory(channel: string, onNotify?: Notify.OnNotifyHandler): IChannel {
            if (!channel) {
                throw new Error(ChannelInitError + 'Empty channel type')
            }

            switch (channel) {
                case UrlParams.WebParentChannel:
                    return new ParentChannel(onNotify)
                case UrlParams.WebOpenerChannel:
                    return new OpenerChannel(onNotify)
                case UrlParams.CefChannel:
                    return new CefChannel(onNotify)
            }

            throw new Error(ChannelInitError + `Unknown channel type '${channel}'`)
        }

        /** Base channel implementation for plugins hosted in a web app.
         * Uses postMessage as a communication channel.
         */
        abstract class WindowChannel implements IChannel {
            //TODO support timeout
            //TODO support sequential processing (queue)
            private readonly _target: Window
            private readonly _onNotify?: Notify.OnNotifyHandler
            private _pending: Pending | null | undefined
            private _queue: QueueItem[] = []

            constructor(target: Window, onNotify?: Notify.OnNotifyHandler) {
                if (!target) {
                    throw new Error(ChannelInitError + 'Missing reference to a client window object')
                }
                else if (target === window) {
                    throw new Error(ChannelInitError + 'Plugin window object and client window object are the same')
                }

                this._target = target
                this._onNotify = onNotify

                window.addEventListener('message', this.onMessage)
            }

            close() {
                window.removeEventListener('message', this.onMessage)
            }
            /** Sends a notification message. A notification is only one way call.
             * The paramter could also be a generic IMessage in the future.
             */
            postMessage(msg: Message.IMessage) {
                const raw: Message.IRawMessage = {
                    protocol: Message.Protocol,
                    version: Message.Version,
                    payload: msg
                }
                this.processOutgoing(raw)
            }

            /**
             * Sends a request message. For every request message one response message is expected to be received.
             * @param msg
             */
            sendRequest(msg: Message.IMessage): Promise<Message.IMessage> {
                const requestId = newRequestId();
                const raw: Message.IRawReqMessage = {
                    protocol: Message.Protocol,
                    version: Message.Version,
                    requestId,
                    payload: msg
                }

                //construct 'pending' object to be able to map incoming response message to a promise
                let pending = (null as any) as Pending
                const p = new Promise<Message.IMessage>((resolve, reject) => {
                    pending = {
                        requestId,
                        resolve,
                        reject
                    }
                })

                this.processOutgoing(raw, pending)
                return p
            }

            onMessage = (e: MessageEvent) => {
                if (e.source !== this._target)    //ignore unknown sources
                    return;

                const raw = e.data
                if (!Message.isRawMessage(raw))     //ignore unknown messages
                    return;

                this.processIncoming(raw)
            }

            private processOutgoing(raw: Message.IRawMessage, pending?: Pending) {
                if (!!this._pending) {
                    this.enqueue(raw, true, pending)
                    return
                }

                this._pending = pending
                this._target.postMessage(raw, '*');       //TODO DEBUG proper target origin
            }

            private processIncoming(raw: Message.IRawMessage) {
                if (Message.isRequest(raw)) {
                    throwNotImplemented();
                }
                else if (Message.isResponse(raw)) {
                    this.onResponse(raw)        //process response directly
                }
                else {
                    if (!!this._pending) {
                        this.enqueue(raw, false)
                        return
                    }

                    const rawPayload = raw.payload
                    if (Message.isMessage(rawPayload)) {
                        this._onNotify && this._onNotify(rawPayload)
                    }
                    else {
                        Log.warn('Notify message ignored', rawPayload)
                    }
                }
            }

            onResponse(rawRes: Message.IRawResMessage) {
                const rawPayload = rawRes.payload
                if (!!this._pending && rawRes.responseId === this._pending.requestId) {
                    const pending = this._pending
                    this._pending = null

                    if (rawRes.isError) {
                        pending.reject(rawPayload)
                    }
                    else if (Message.isMessage(rawPayload)) {
                        pending.resolve(rawPayload)
                    }
                    else {
                        Log.error('Invalid response message', rawPayload)
                    }

                    this.processMessageQueue()
                }
                else {
                    Log.error('Unexpected response message or response after timeout', rawPayload)
                }
            }

            private enqueue(raw: Message.IRawMessage, isOutgoing: boolean, pending?: Pending) {
                const item: QueueItem = {
                    raw,
                    isOutgoing,
                    pending
                }
                this._queue.push(item)
            }

            private processMessageQueue() {
                while (!this._pending && this._queue.length > 0) {
                    const item = this._queue.splice(0, 1)[0]

                    if (item.isOutgoing) {
                        this.processOutgoing(item.raw, item.pending)
                    }
                    else {
                        this.processIncoming(item.raw)
                    }
                }
            }
        }

        /** Channel for plugins running in an iframe
         */
        class ParentChannel extends WindowChannel {
            constructor(onNotify?: Notify.OnNotifyHandler) {
                super(window.parent, onNotify)
            }
        }

        /** Channel for plugins running in a new tab
         */
        class OpenerChannel extends WindowChannel {
            constructor(onNotify?: Notify.OnNotifyHandler) {
                super(window.opener as Window, onNotify)
            }
        }

        /** Methods of the proxy instance returns Promise which is
         * resolved rejected when the method returns.
         */
        interface CefClientProxy {
            onNotify(msgJson: string): Promise<void>;
            onRequest(msgJson: string): Promise<string>;
        }

        /** The name of the global proxy object (comming from IE implementation, in cef configurable)*/
        declare const external: CefClientProxy

        /** Channel implementation for plugins hosted 
         * in a client app in a cefsharp browser engine.
         * The client app registers an object which proxy instance with public methods
         * is available in JS.
         *
         * Unlike window channel requests are not wrapped as raw messages but passed directly in the call to external proxy.
         * Returning promise is used pass response.
         * Only one worker thread (not main UI thread) is used in cefsharp for external calls so further internal synchronization of calls is not required.
         */
        class CefChannel implements IChannel {
            private readonly _onNotify?: Notify.OnNotifyHandler

            constructor(onNotify?: Notify.OnNotifyHandler) {
                this._onNotify = onNotify

                window.addEventListener('message', this.onMessage)
            }

            close() {
                window.removeEventListener('message', this.onMessage)
            }

            postMessage(msg: Message.IMessage) {
                external.onNotify(JSON.stringify(msg));
            }

            sendRequest(msg: Message.IMessage): Promise<Message.IMessage> {
                const p = new Promise<Message.IMessage>((resolve, reject) => {
                    external.onRequest(JSON.stringify(msg)).then(json => {
                        if (!json)
                            reject('Empty response from client')

                        try {
                            const msg = JSON.parse(json) as {}

                            if (typeof msg === 'object' && Message.isMessage(msg)) {
                                resolve(msg)
                            }
                            else
                                reject('Invalid response object from client')
                        } catch (e) {
                            reject('Invalid response format from client')
                        }
                    }, (reason) => {
                        if (typeof reason === 'string') {
                            const error = CefChannel.tryParseError(reason)
                            if (!!error) {
                                reject(error)
                                return
                            }
                        }

                        const error = { message: String(reason) } as Message.IError
                        reject(error)
                    })
                })
                return p
            }

            onMessage = (e: MessageEvent) => {
                if (e.source !== window)    //ignore unknown sources
                    return;

                const msg = e.data      //JS message object is passed directly
                if (!Message.isMessage(msg))
                    return
                this._onNotify && this._onNotify(msg)
            }

            /** When external handler throws then the .net exception is serialized to a string passed as a rejection reason to the promise.
             * IError object should be encoded as a json in the message property as [[{ IError object json string }]]
             * Json begins with [[ and ends with ]].
             * Example: [[{"message":"Invalid parameter"}]]
             * @param reason exception formatted by cefsharp
             */
            static tryParseError(reason: string): Message.IError | null {
                const jsonStart = reason.indexOf('[[{')
                if (jsonStart < 0) return null
                const jsonEnd = reason.indexOf('}]]')
                if (jsonEnd < 0) return null

                const json = reason.substring(jsonStart + 2 /*2 squre brackets*/, jsonEnd + 1 /*curly bracket*/)
                try {
                    const error = JSON.parse(json)
                    if (Message.isError(error))
                        return error
                } catch { }
                return null
            }
        }
    }
}