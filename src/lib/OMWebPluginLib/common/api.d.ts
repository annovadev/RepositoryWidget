declare namespace OMWebPluginLib {
    /** API types
     */
    namespace OMApi {
        type User = {
            readonly userId: number;
            readonly userName: string;
            readonly description: string;
            readonly email: string;
        };
        type WebPluginHostApp = 'newsboard' | 'richclient';
        interface IOpenDocumentOptions {
            hostApp: WebPluginHostApp;
        }
        interface NewsboardOpenDocumentOptions extends IOpenDocumentOptions {
            hostApp: 'newsboard';
            target?: 'default' | 'newwindow' | 'newtab';
            useAnyplace?: boolean;
        }
        interface RichclientOpenDocumentOptions extends IOpenDocumentOptions {
            hostApp: 'richclient';
            target?: 'default' | 'newtab' | 'newworkwindow';
            orientation?: 'vertical' | 'horizontal';
        }
        type OpenDocumentOptions = NewsboardOpenDocumentOptions | RichclientOpenDocumentOptions;
        interface IUI {
            linkToNew(downlinkId: OMTypes.DocumentId, templateId?: Partial<OMTypes.TemplateId>): Promise<void>;
            openDocument(docId: OMTypes.DocumentId, options?: ReadonlyArray<OpenDocumentOptions>): Promise<void>;
        }
        interface IApi {
            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string): Promise<OMTypes.DocumentId>;
            createDocumentEx(templateId: number, folder: OMTypes.DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<OMTypes.DocumentId>;
            getFields(docId: OMTypes.DocumentId, fieldIds: ReadonlyArray<FieldId>): Promise<Field[]>;
            setFields(docId: OMTypes.DocumentId, fields: ReadonlyArray<Field>): Promise<void>;
            getCurrentDocumentId(): Promise<OMTypes.DocumentId | null>;
            getCurrentUser(): Promise<OMApi.User>;
            getCurrentContext(): Promise<OMTypes.DocumentContext>;
            getRecordIds(docId: OMTypes.DocumentId): Promise<number[]>;
            setDownlink(docId: OMTypes.DocumentId, recId: number, linkId?: OMTypes.DocumentId | null): Promise<void>;
            getUplinks(docId: OMTypes.DocumentId): Promise<number[]>;
            getDownlink(docId: OMTypes.DocumentId, recId: number): Promise<OMTypes.Downlink>;
            insertRecord(docId: OMTypes.DocumentId, recId: number): Promise<number>;
            deleteRecord(docId: OMTypes.DocumentId, recId: number): Promise<void>;
            readonly ui: IUI;
        }
        type FieldId = {
            readonly id: number;
            readonly recordId?: number;
        };
        enum FieldValueType {
            String = 1,
            Number = 2,
            DateTime = 3,
            TimeSpan = 4,
            ObjectId = 5,
            Blob = 6,
            Bits64 = 7,
        }
        interface IField {
            readonly valueType: FieldValueType;
            readonly fieldId: FieldId;
        }
        /** Field value types always must be able to represent 'empty' value
        */
        type StringFieldValue = string | null;
        interface StringField extends IField {
            readonly valueType: FieldValueType.String;
            readonly value: StringFieldValue;
        }
        type IntFieldValue = number | null;
        interface IntField extends IField {
            readonly valueType: FieldValueType.Number;
            readonly value: IntFieldValue;
        }
        type DateTimeFieldValue = string | null;
        interface DateTimeField extends IField {
            readonly valueType: FieldValueType.DateTime;
            readonly value: DateTimeFieldValue;
        }
        type TimeSpanFieldValue = number | null;
        interface TimeSpanField extends IField {
            readonly valueType: FieldValueType.TimeSpan;
            readonly value: TimeSpanFieldValue;
        }
        type Field = StringField | IntField | DateTimeField | TimeSpanField;
        function stringField(value: StringFieldValue, fieldId: number, recordId?: number): StringField;
        function intField(value: IntFieldValue, fieldId: number, recordId?: number): IntField;
        /** Returns new DateTimeField object
         * @param value
         *      Date: object created by new Date(...)
         *      string: preferably ISO format but general any format accepted by new Date(...)
         *      number: a number representing the milliseconds elapsed between 1 January 1970 00:00:00 UTC and the given date (see Date.prototype.getTime)
         * @param fieldId
         * @param recordId
         */
        function dateTimeField(value: Date | string | number, fieldId: number, recordId?: number): DateTimeField;
        /** Returns new TimeSpanField object
         * @param milliSec a number of milliseconds
         * @param fieldId
         * @param recordId
         */
        function timeSpanField(milliSec: number, fieldId: number, recordId?: number): TimeSpanField;
        function encodeDocumentId(documentId: OMTypes.DocumentId): string;
    }
    /** API calls
     */
    namespace OMApi {
        type ApiMessage = Message.IMessage & {
            readonly json: string;
        };
        const Module = "api";
        function isApiMessage(msg: Message.IMessage): msg is ApiMessage;
        class ApiCall<TType extends string, TReq, TRes> {
            readonly type: TType;
            constructor(type: TType);
            toReq(req: TReq): ApiMessage;
            fromReq(reqMsg: ApiMessage): TReq;
            fromRes(msg: ApiMessage): TRes;
            toRes(res: TRes): ApiMessage;
        }
        const Messages: {
            createDocument: ApiCall<"createDocument", {
                templateId: number;
                folderLoId: number;
                poolId: number;
                systemId?: string | undefined;
            }, OMTypes.DocumentId>;
            createDocumentEx: ApiCall<"createDocumentEx", {
                templateId: number;
                folder: OMTypes.DocumentId;
                fields: ReadonlyArray<Field>;
            }, OMTypes.DocumentId>;
            getFields: ApiCall<"getFields", {
                docId: OMTypes.DocumentId;
                fieldIds: ReadonlyArray<FieldId>;
            }, Field[]>;
            setFields: ApiCall<"setFields", {
                docId: OMTypes.DocumentId;
                fields: ReadonlyArray<Field>;
            }, void>;
            getCurrentDocumentId: ApiCall<"getCurrentDocumentId", null, OMTypes.DocumentId | null>;
            getCurrentUser: ApiCall<"getCurrentUser", null, User>;
            linkToNew: ApiCall<"linkToNew", {
                downlinkId: OMTypes.DocumentId;
                templateId?: Partial<OMTypes.TemplateId> | undefined;
            }, void>;
            openDocument: ApiCall<"openDocument", {
                docId: OMTypes.DocumentId;
                options?: ReadonlyArray<OpenDocumentOptions> | undefined;
            }, void>;
            getCurrentContext: ApiCall<"getCurrentContext", null, OMTypes.DocumentContext>;
            getRecordIds: ApiCall<"getRecordIds", OMTypes.DocumentId, number[]>;
            setDownlink: ApiCall<"setDownlink", {
                docId: OMTypes.DocumentId;
                recId: number;
                linkId?: OMTypes.DocumentId | undefined;
            }, void>;
            getUplinks: ApiCall<"getUplinks", OMTypes.DocumentId, number[]>;
            getDownlink: ApiCall<"getDownlink", {
                docId: OMTypes.DocumentId;
                recId: number;
            }, OMTypes.Downlink>;
            insertRecord: ApiCall<"insertRecord", {
                docId: OMTypes.DocumentId;
                recId: number;
            }, number>;
            deleteRecord: ApiCall<"deleteRecord", {
                docId: OMTypes.DocumentId;
                recId: number;
            }, void>;
        };
    }
}
