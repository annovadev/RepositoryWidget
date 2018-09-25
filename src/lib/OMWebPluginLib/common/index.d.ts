declare namespace OMWebPluginLib {
    function throwNotImplemented(): never;
    namespace Log {
        function warn(message: any, ...args: any[]): void;
        function error(message: any, ...args: any[]): void;
        function info(message: any, ...args: any[]): void;
    }
    type StringKeyValueMap<T> = {
        [key: string]: T;
    };
    type StringStringMap = StringKeyValueMap<string>;
    namespace UrlParams {
        const Channel = "channel";
        const PluginConfig = "pluginconfig";
        const WebParentChannel = "parent";
        const WebOpenerChannel = "opener";
        const CefChannel = "cef";
        /** Channel specifies how are messages transfered between client and plugin.
         * Channel must support both directions.
        */
        type Channel = typeof CefChannel | typeof WebParentChannel | typeof WebOpenerChannel;
    }
    namespace Message {
        const Protocol: string;
        const Version: number;
        type XMLString = string;
        interface IRawMessage {
            readonly protocol: typeof Protocol;
            readonly version: typeof Version;
            readonly payload: {};
        }
        interface IRawReqMessage extends IRawMessage {
            readonly requestId: number;
        }
        interface IRawResMessage extends IRawMessage {
            readonly responseId: number;
            readonly isError?: boolean;
        }
        interface IMessage {
            readonly module: string;
            readonly type: string;
        }
        interface IError {
            message: string;
            stack?: string;
            inner?: IError;
        }
        function isRawMessage(msg: any): msg is IRawMessage;
        function isRequest(msg: IRawMessage): msg is IRawReqMessage;
        function isResponse(msg: IRawMessage): msg is IRawResMessage;
        function isMessage(rawPayload: {}): rawPayload is IMessage;
        function isError(reason: {}): reason is IError;
    }
    /** OpenMedia types used by library*/
    namespace OMTypes {
        type ObjectIdBase64 = string;
        type TemplateId = {
            readonly lowId: number;
            readonly systemId: string;
        };
        type DocumentId = {
            readonly lowId: number;
            readonly poolId: number;
            readonly systemId: string;
        };
        type DocumentContext = {
            readonly currentDocumentId: DocumentId;
            readonly parentDocumentId: DocumentId | null;
            readonly parentRecordId: number | null;
        };
        type Downlink = {
            readonly docId: DocumentId;
            readonly templateId: number;
            readonly templateType: number;
        };
    }
    /** Defines common notification messages
     */
    namespace Notify {
        namespace Lifecycle {
            const Module = "lifecycle";
            const Ready = "ready";
        }
        namespace View {
            const Module = "view";
            const ContentSize = "contentsize";
            type ContentSizePayload = {
                width: number;
                height: number;
            };
        }
        namespace Board {
            const Module = "board";
            const SetWidgetConfig = "setWidgetConfig";
            const SetFederatedSearch = "setFederatedSearch";
        }
        namespace UserAction {
            const Module = "useraction";
            const OK = "ok";
            const Cancel = "cancel";
            type Type = typeof OK | typeof Cancel;
        }
        namespace Document {
            const Module = "document";
            const SetCurrentDocument = "setCurrentDocument";
            type SetCurrentDocumentPayload = {
                documentId: OMTypes.DocumentId;
            };
        }
        type NotifyPayload = {};
        type NotifyMessage = Message.IMessage & {
            readonly json?: string;
        };
        function parsePayload(msg: Message.IMessage): {} | null;
        type OnNotifyHandler = (msg: Message.IMessage) => void;
    }
}
