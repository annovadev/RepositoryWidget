namespace OMWebPluginLib {
    export namespace Plugin {
        function decodeUrlParams(): Readonly<StringStringMap> {
            var search: string = window.location.search;
            var qs: string = search.split("+").join(" ");
            var params: StringStringMap = {}

            var regex: RegExp = /[?&]?([^=]+)=([^&]*)/g;
            var tokens: RegExpExecArray | null;
            while (tokens = regex.exec(qs)) {
                if (!tokens || tokens.length < 1) {
                    continue;
                }
                var key: string = decodeURIComponent(tokens[1]);
                if (!tokens || tokens.length > 1) {
                    const value = decodeURIComponent(tokens[2]);
                    params[key] = value;
                }
            }
            return params
        }

        export type OnNotifyHandler = Notify.OnNotifyHandler

        type BuilderProps = {
            onNotify?: OnNotifyHandler,
            urlParams: Readonly<StringStringMap>
        }

        /**
         */
        export class SamePageBuilder {
            private _props: BuilderProps

            static create() {
                return new SamePageBuilder()
            }

            constructor() {
                const urlParams = decodeUrlParams()
                this._props = {
                    urlParams
                }
            }

            /** Returns plugin config record passed as JSON in url
             */
            getPluginConfig(): any {
                const json = this._props.urlParams[UrlParams.PluginConfig];
                if (!json)
                    return null
                const result = JSON.parse(json)
                return result
            }

            getUrlProps(): Readonly<StringStringMap> {
                return this._props.urlParams;
            }

            /** Register notify handler
             * @param handler
             */
            onNotify(handler: OnNotifyHandler): SamePageBuilder {
                this._props.onNotify = handler
                return this
            }

            //getProps(): Readonly<{}> {
            //    return this._props
            //}

            /**Returns new instance plugin instance or throws error when plugin can not be initialized.
             * Can be called only once.
             */
            createPlugin(): IPlugin {
                const channel = Host.channelFactory(this._props.urlParams[UrlParams.Channel], this._props.onNotify)
                const plugin = new SamePagePlugin(channel)
                //window.setTimeout(() => {
                //    plugin.isReady && plugin.postNotify(Notify.Lifecycle.Module, Notify.Lifecycle.Ready)
                //}, 0)
                plugin.isReady && plugin.postNotify(Notify.Lifecycle.Module, Notify.Lifecycle.Ready)
                return plugin
            }

            /**Returns new instance or null when plugin can not be initialized.
             * Can be called only once.
             */
            createPluginSafe(): IPlugin | null {
                try {
                    return this.createPlugin()
                } catch (e) {
                    Log.error("Plugin could not be initialised", e)
                }
                return null
            }
        }

        export type Builder = SamePageBuilder


        export interface IPlugin {
            /** Sends notification message to a client.
             * The client needs to undestand the message
             */
            postNotify(module: string, type: string, payload?: Notify.NotifyPayload): void;

            getApi(): OMApi.IApi;

            //getUIApi(): OMApi.IUIApi;
        }

        class SamePagePlugin implements IPlugin {
            private readonly _channel: Host.IChannel;
            private _isReady = false;
            private _api: OMApi.IApi | null = null
            //private _uiApi: OMApi.IUIApi | null = null

            constructor(channel: Host.IChannel) {
                this._channel = channel
                this._isReady = true
            }

            get isReady(): boolean {
                return this._isReady;
            }

            getChannel() {
                return this._channel
            }

            postNotify(module: string, type: string, payload?: Notify.NotifyPayload): void {
                const msg: Notify.NotifyMessage = {
                    module,
                    type,
                    json: !!payload ? JSON.stringify(payload) : undefined
                }
                this._channel.postMessage(msg)
            }

            getApi(): OMApi.IApi {
                if (!this._api)
                    this._api = new Host.ApiModule(this._channel)
                return this._api
            }

            //getUIApi(): OMApi.IUIApi {
            //    if (!this._uiApi)
            //        this._uiApi = new Host.UIApiModule(this._channel)
            //    return this._uiApi
            //}
        }

        export function createPlugin(builder: Builder): IPlugin {
            return builder.createPlugin()
        }

        /**
         * Normally it is responsibility of the client to destroy plugin instance. 
         * @param plugin - instance
         */
        export function destroyPlugin(plugin: IPlugin): void {
            if (plugin instanceof SamePagePlugin) {
                plugin.getChannel().close()
            }
        }
    }
}