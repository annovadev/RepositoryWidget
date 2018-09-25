declare namespace OMWebPluginLib {
    namespace Plugin {
        type OnNotifyHandler = Notify.OnNotifyHandler;
        /**
         */
        class SamePageBuilder {
            private _props;
            static create(): SamePageBuilder;
            constructor();
            /** Returns plugin config record passed as JSON in url
             */
            getPluginConfig(): any;
            getUrlProps(): Readonly<StringStringMap>;
            /** Register notify handler
             * @param handler
             */
            onNotify(handler: OnNotifyHandler): SamePageBuilder;
            /**Returns new instance plugin instance or throws error when plugin can not be initialized.
             * Can be called only once.
             */
            createPlugin(): IPlugin;
            /**Returns new instance or null when plugin can not be initialized.
             * Can be called only once.
             */
            createPluginSafe(): IPlugin | null;
        }
        type Builder = SamePageBuilder;
        interface IPlugin {
            /** Sends notification message to a client.
             * The client needs to undestand the message
             */
            postNotify(module: string, type: string, payload?: Notify.NotifyPayload): void;
            getApi(): OMApi.IApi;
        }
        function createPlugin(builder: Builder): IPlugin;
        /**
         * Normally it is responsibility of the client to destroy plugin instance.
         * @param plugin - instance
         */
        function destroyPlugin(plugin: IPlugin): void;
    }
}
