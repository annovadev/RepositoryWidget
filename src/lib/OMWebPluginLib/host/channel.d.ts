declare namespace OMWebPluginLib {
    namespace Host {
        interface IChannel {
            close(): any;
            postMessage(msg: Message.IMessage): any;
            sendRequest(msg: Message.IMessage): Promise<Message.IMessage>;
        }
        /** Return new channel or null if type not
         * @param channel
         */
        function channelFactory(channel: string, onNotify?: Notify.OnNotifyHandler): IChannel;
    }
}
