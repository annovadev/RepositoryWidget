"use strict";
var OMWebPluginLib;
(function (OMWebPluginLib) {
    var Plugin;
    (function (Plugin) {
        function decodeUrlParams() {
            var search = window.location.search;
            var qs = search.split("+").join(" ");
            var params = {};
            var regex = /[?&]?([^=]+)=([^&]*)/g;
            var tokens;
            while (tokens = regex.exec(qs)) {
                if (!tokens || tokens.length < 1) {
                    continue;
                }
                var key = decodeURIComponent(tokens[1]);
                if (!tokens || tokens.length > 1) {
                    var value = decodeURIComponent(tokens[2]);
                    params[key] = value;
                }
            }
            return params;
        }
        /**
         */
        var SamePageBuilder = /** @class */ (function () {
            function SamePageBuilder() {
                var urlParams = decodeUrlParams();
                this._props = {
                    urlParams: urlParams
                };
            }
            SamePageBuilder.create = function () {
                return new SamePageBuilder();
            };
            /** Returns plugin config record passed as JSON in url
             */
            SamePageBuilder.prototype.getPluginConfig = function () {
                var json = this._props.urlParams[OMWebPluginLib.UrlParams.PluginConfig];
                if (!json)
                    return null;
                var result = JSON.parse(json);
                return result;
            };
            SamePageBuilder.prototype.getUrlProps = function () {
                return this._props.urlParams;
            };
            /** Register notify handler
             * @param handler
             */
            SamePageBuilder.prototype.onNotify = function (handler) {
                this._props.onNotify = handler;
                return this;
            };
            //getProps(): Readonly<{}> {
            //    return this._props
            //}
            /**Returns new instance plugin instance or throws error when plugin can not be initialized.
             * Can be called only once.
             */
            SamePageBuilder.prototype.createPlugin = function () {
                var channel = OMWebPluginLib.Host.channelFactory(this._props.urlParams[OMWebPluginLib.UrlParams.Channel], this._props.onNotify);
                var plugin = new SamePagePlugin(channel);
                //window.setTimeout(() => {
                //    plugin.isReady && plugin.postNotify(Notify.Lifecycle.Module, Notify.Lifecycle.Ready)
                //}, 0)
                plugin.isReady && plugin.postNotify(OMWebPluginLib.Notify.Lifecycle.Module, OMWebPluginLib.Notify.Lifecycle.Ready);
                return plugin;
            };
            /**Returns new instance or null when plugin can not be initialized.
             * Can be called only once.
             */
            SamePageBuilder.prototype.createPluginSafe = function () {
                try {
                    return this.createPlugin();
                }
                catch (e) {
                    OMWebPluginLib.Log.error("Plugin could not be initialised", e);
                }
                return null;
            };
            return SamePageBuilder;
        }());
        Plugin.SamePageBuilder = SamePageBuilder;
        var SamePagePlugin = /** @class */ (function () {
            //private _uiApi: OMApi.IUIApi | null = null
            function SamePagePlugin(channel) {
                this._isReady = false;
                this._api = null;
                this._channel = channel;
                this._isReady = true;
            }
            Object.defineProperty(SamePagePlugin.prototype, "isReady", {
                get: function () {
                    return this._isReady;
                },
                enumerable: true,
                configurable: true
            });
            SamePagePlugin.prototype.getChannel = function () {
                return this._channel;
            };
            SamePagePlugin.prototype.postNotify = function (module, type, payload) {
                var msg = {
                    module: module,
                    type: type,
                    json: !!payload ? JSON.stringify(payload) : undefined
                };
                this._channel.postMessage(msg);
            };
            SamePagePlugin.prototype.getApi = function () {
                if (!this._api)
                    this._api = new OMWebPluginLib.Host.ApiModule(this._channel);
                return this._api;
            };
            return SamePagePlugin;
        }());
        function createPlugin(builder) {
            return builder.createPlugin();
        }
        Plugin.createPlugin = createPlugin;
        /**
         * Normally it is responsibility of the client to destroy plugin instance.
         * @param plugin - instance
         */
        function destroyPlugin(plugin) {
            if (plugin instanceof SamePagePlugin) {
                plugin.getChannel().close();
            }
        }
        Plugin.destroyPlugin = destroyPlugin;
    })(Plugin = OMWebPluginLib.Plugin || (OMWebPluginLib.Plugin = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=index.js.map