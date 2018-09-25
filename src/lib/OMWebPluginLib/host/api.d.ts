declare namespace OMWebPluginLib {
    namespace Host {
        class ApiModule implements OMApi.IApi {
            private readonly _channel;
            constructor(channel: IChannel);
            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string): Promise<OMTypes.DocumentId>;
            createDocumentEx(templateId: number, folder: OMTypes.DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<OMTypes.DocumentId>;
            getFields(docId: OMTypes.DocumentId, fieldIds: ReadonlyArray<OMApi.FieldId>): Promise<OMApi.Field[]>;
            setFields(docId: OMTypes.DocumentId, fields: ReadonlyArray<OMApi.Field>): Promise<void>;
            getCurrentDocumentId(): Promise<OMTypes.DocumentId | null>;
            getCurrentUser(): Promise<OMApi.User>;
            getCurrentContext(): Promise<OMTypes.DocumentContext>;
            getRecordIds(docId: OMTypes.DocumentId): Promise<number[]>;
            setDownlink(docId: OMTypes.DocumentId, recId: number, linkId?: OMTypes.DocumentId): Promise<void>;
            getUplinks(docId: OMTypes.DocumentId): Promise<number[]>;
            getDownlink(docId: OMTypes.DocumentId, recId: number): Promise<OMTypes.Downlink>;
            insertRecord(docId: OMTypes.DocumentId, recId: number): Promise<number>;
            deleteRecord(docId: OMTypes.DocumentId, recId: number): Promise<void>;
            readonly ui: OMApi.IUI;
            call<TType extends string, TReq, TRes>(creator: OMApi.ApiCall<TType, TReq, TRes>, req: TReq): Promise<TRes>;
        }
    }
}
