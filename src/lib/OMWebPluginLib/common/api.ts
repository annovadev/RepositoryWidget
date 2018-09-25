namespace OMWebPluginLib {
    /** API types
     */
    export namespace OMApi {
        export type User = {
            readonly userId: number;
            readonly userName: string;
            readonly description: string;
            readonly email: string;
        }

        export type WebPluginHostApp = 'newsboard' | 'richclient'

        export interface IOpenDocumentOptions {
            hostApp: WebPluginHostApp;
        }

        export interface NewsboardOpenDocumentOptions extends IOpenDocumentOptions {
            hostApp: 'newsboard';
            target?: 'default' | 'newwindow' | 'newtab';      //can we fully control this?
            useAnyplace?: boolean
            //win props?
        }

        export interface RichclientOpenDocumentOptions extends IOpenDocumentOptions {
            hostApp: 'richclient';
            target?: 'default' | 'newtab' | 'newworkwindow';
            orientation?: 'vertical' | 'horizontal'
        }
        export type OpenDocumentOptions = NewsboardOpenDocumentOptions | RichclientOpenDocumentOptions

        export interface IUI {
            linkToNew(downlinkId: OMTypes.DocumentId, templateId?: Partial<OMTypes.TemplateId>): Promise<void>;
            openDocument(docId: OMTypes.DocumentId, options?: ReadonlyArray<OpenDocumentOptions>): Promise<void>;
        }

        export interface IApi {
            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string): Promise<OMTypes.DocumentId>;
            createDocumentEx(templateId: number, folder: OMTypes.DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<OMTypes.DocumentId>;

            getFields(docId: OMTypes.DocumentId, fieldIds: ReadonlyArray<FieldId>): Promise<Field[]>;
            setFields(docId: OMTypes.DocumentId, fields: ReadonlyArray<Field>): Promise<void>;

            getCurrentDocumentId(): Promise<OMTypes.DocumentId | null>;
            getCurrentUser(): Promise<OMApi.User>;
            getCurrentContext(): Promise<OMTypes.DocumentContext>

            //linkToNew(downlinkId: OMTypes.DocumentId, templateId?: Partial<OMTypes.TemplateId>): Promise<void>;
            getRecordIds(docId: OMTypes.DocumentId): Promise<number[]>;
            setDownlink(docId: OMTypes.DocumentId, recId: number, linkId?: OMTypes.DocumentId | null): Promise<void>;
            getUplinks(docId: OMTypes.DocumentId): Promise<number[]>;
            getDownlink(docId: OMTypes.DocumentId, recId: number): Promise<OMTypes.Downlink>;
            insertRecord(docId: OMTypes.DocumentId, recId: number): Promise<number>;
            deleteRecord(docId: OMTypes.DocumentId, recId: number): Promise<void>;
            readonly ui: IUI
        }

        export type FieldId = {
            readonly id: number;
            readonly recordId?: number;
        }

        export enum FieldValueType {
            //Def_Type = 0,
            String = 1,
            Number = 2,         //Int
            DateTime = 3,
            TimeSpan = 4,
            ObjectId = 5,       //ObjectID
            Blob = 6,
            Bits64 = 7,
        }

        export interface IField {
            readonly valueType: FieldValueType
            readonly fieldId: FieldId;
        }

        /** Field value types always must be able to represent 'empty' value
        */
        export type StringFieldValue = string | null
        export interface StringField extends IField {
            readonly valueType: FieldValueType.String;
            readonly value: StringFieldValue;
        }

        export type IntFieldValue = number | null
        export interface IntField extends IField {
            readonly valueType: FieldValueType.Number;
            readonly value: IntFieldValue;
        }

        export type DateTimeFieldValue = string | null      //transferred in ISO UTC format
        export interface DateTimeField extends IField {
            readonly valueType: FieldValueType.DateTime;
            readonly value: DateTimeFieldValue;
        }

        export type TimeSpanFieldValue = number | null      //milliseconds
        export interface TimeSpanField extends IField {
            readonly valueType: FieldValueType.TimeSpan;
            readonly value: TimeSpanFieldValue;
        }

        export type Field = StringField | IntField | DateTimeField | TimeSpanField

        export function stringField(value: StringFieldValue, fieldId: number, recordId?: number): StringField {
            return {
                valueType: FieldValueType.String,
                fieldId: { id: fieldId, recordId },
                value
            }
        }

        export function intField(value: IntFieldValue, fieldId: number, recordId?: number): IntField {
            return {
                valueType: FieldValueType.Number,
                fieldId: { id: fieldId, recordId },
                value
            }
        }

        function _dateTimeField(value: string, fieldId: number, recordId?: number): DateTimeField {
            return {
                valueType: FieldValueType.DateTime,
                fieldId: { id: fieldId, recordId },
                value
            }
        }

        /** Returns new DateTimeField object
         * @param value
         *      Date: object created by new Date(...)
         *      string: preferably ISO format but general any format accepted by new Date(...)
         *      number: a number representing the milliseconds elapsed between 1 January 1970 00:00:00 UTC and the given date (see Date.prototype.getTime)
         * @param fieldId
         * @param recordId
         */
        export function dateTimeField(value: Date | string | number, fieldId: number, recordId?: number): DateTimeField {
            if (value instanceof Date) {
                return _dateTimeField(value.toISOString(), fieldId, recordId)
            }
            else if (typeof value === 'string') {
                return _dateTimeField((new Date(value)).toISOString(), fieldId, recordId)
            }
            else if (typeof value === 'number') {
                return _dateTimeField((new Date(value)).toISOString(), fieldId, recordId)
            }

            throw new TypeError('Unexpected date time field value')
        }

        /** Returns new TimeSpanField object
         * @param milliSec a number of milliseconds
         * @param fieldId
         * @param recordId
         */
        export function timeSpanField(milliSec: number, fieldId: number, recordId?: number): TimeSpanField {
            return {
                valueType: FieldValueType.TimeSpan,
                fieldId: { id: fieldId, recordId },
                value: milliSec
            }
        }

        //export interface IDocument {
        //    setFields(fields: ReadonlyArray<Field>): Promise<void>
        //}

        export function encodeDocumentId(documentId: OMTypes.DocumentId) {
            //String.Format("<{0},{1},{2}>", PoolID, PinnID, SystemID);
            const raw = `<${documentId.poolId},${documentId.lowId},${documentId.systemId}>`
            const encoded = btoa(raw)
            return encoded
        }
    }

    /** API calls
     */
    export namespace OMApi {
        export type ApiMessage = Message.IMessage & { readonly json: string }
        export const Module = 'api'

        export function isApiMessage(msg: Message.IMessage): msg is ApiMessage {
            return typeof msg === 'object' && typeof (msg as ApiMessage).json === 'string'
        }

        export class ApiCall<TType extends string, TReq, TRes> {    //TODO DEBUG need 3 call types req/res, empty req, empty res
            readonly type: TType;

            constructor(type: TType) {
                this.type = type;
            }

            toReq(req: TReq): ApiMessage {
                return {
                    module: Module,
                    type: this.type,
                    json: JSON.stringify(req)
                }
            }

            fromReq(reqMsg: ApiMessage): TReq {
                const req = JSON.parse(reqMsg.json) as TReq
                return req
            }

            fromRes(msg: ApiMessage): TRes {
                const res = JSON.parse(msg.json) as TRes
                return res
            }

            toRes(res: TRes): ApiMessage {
                return {
                    module: Module,
                    type: this.type,
                    json: JSON.stringify(res)
                }
            }
        }

        export const Messages = {
            createDocument: new ApiCall<'createDocument',
                { templateId: number, folderLoId: number, poolId: number, systemId?: string },
                OMTypes.DocumentId>('createDocument'),

            createDocumentEx: new ApiCall<'createDocumentEx',
                { templateId: number, folder: OMTypes.DocumentId, fields: ReadonlyArray<Field> },
                OMTypes.DocumentId>('createDocumentEx'),

            getFields: new ApiCall<'getFields',
                { docId: OMTypes.DocumentId, fieldIds: ReadonlyArray<FieldId> },
                Field[]>('getFields'),

            setFields: new ApiCall<'setFields',
                { docId: OMTypes.DocumentId, fields: ReadonlyArray<Field> },
                void>('setFields'),

            getCurrentDocumentId: new ApiCall<'getCurrentDocumentId',
                null,
                OMTypes.DocumentId | null>('getCurrentDocumentId'),

            getCurrentUser: new ApiCall<'getCurrentUser',
                null,
                OMApi.User>('getCurrentUser'),

            linkToNew: new ApiCall<'linkToNew',
                { downlinkId: OMTypes.DocumentId, templateId?: Partial<OMTypes.TemplateId> },
                void>('linkToNew'),

            openDocument: new ApiCall<'openDocument',
                { docId: OMTypes.DocumentId, options?: ReadonlyArray<OMApi.OpenDocumentOptions> },
                void>('openDocument'),

            getCurrentContext: new ApiCall<'getCurrentContext',
                null,
                OMTypes.DocumentContext>('getCurrentContext'),

            getRecordIds: new ApiCall<'getRecordIds',
                OMTypes.DocumentId,
                number[]>('getRecordIds'),

            setDownlink: new ApiCall<'setDownlink',
                { docId: OMTypes.DocumentId, recId: number, linkId?: OMTypes.DocumentId }, void>('setDownlink'),

            getUplinks: new ApiCall<'getUplinks', OMTypes.DocumentId, number[]>('getUplinks'),
            getDownlink: new ApiCall<'getDownlink', { docId: OMTypes.DocumentId, recId: number }, OMTypes.Downlink>('getDownlink'),

            insertRecord: new ApiCall<'insertRecord',
                { docId: OMTypes.DocumentId, recId: number },
                number>('insertRecord'),

            deleteRecord: new ApiCall<'deleteRecord',
                { docId: OMTypes.DocumentId, recId: number },
                void>('deleteRecord')

        }
    }
}