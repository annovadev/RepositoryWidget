namespace OMWebPluginLib {
    export namespace Host {

        export class ApiModule implements OMApi.IApi {
            private readonly _channel: IChannel
            constructor(channel: IChannel) {
                this._channel = channel

                this.ui = {
                    linkToNew: (downlinkId: OMTypes.DocumentId, templateId?: Partial<OMTypes.TemplateId>) => {
                        return this.call(OMApi.Messages.linkToNew,
                            { downlinkId, templateId })
                    },
                    openDocument: (docId: OMTypes.DocumentId, options?: ReadonlyArray<OMApi.OpenDocumentOptions>) => {
                        return this.call(OMApi.Messages.openDocument,
                            { docId, options })
                    }
                }
            }

            createDocument(templateId: number, folderLoId: number, poolId: number, systemId?: string) {
                return this.call(OMApi.Messages.createDocument,
                    { templateId, folderLoId, poolId, systemId })
            }

            createDocumentEx(templateId: number, folder: OMTypes.DocumentId, fields: ReadonlyArray<OMApi.Field>) {
                return this.call(OMApi.Messages.createDocumentEx,
                    { templateId, folder, fields })
            }

            getFields(docId: OMTypes.DocumentId, fieldIds: ReadonlyArray<OMApi.FieldId>) {
                return this.call(OMApi.Messages.getFields,
                    { docId, fieldIds })
            }

            setFields(docId: OMTypes.DocumentId, fields: ReadonlyArray<OMApi.Field>) {
                return this.call(OMApi.Messages.setFields,
                    { docId, fields })
            }

            getCurrentDocumentId() {
                return this.call(OMApi.Messages.getCurrentDocumentId, null)
            }

            getCurrentUser() {
                return this.call(OMApi.Messages.getCurrentUser, null)
            }

            getCurrentContext() {
                return this.call(OMApi.Messages.getCurrentContext, null);
            }

            getRecordIds(docId: OMTypes.DocumentId): Promise<number[]> {
                return this.call(OMApi.Messages.getRecordIds, docId)
            }

            setDownlink(docId: OMTypes.DocumentId, recId: number, linkId?: OMTypes.DocumentId): Promise<void> {
                return this.call(OMApi.Messages.setDownlink, { docId, recId, linkId})
            }

            getUplinks(docId: OMTypes.DocumentId): Promise<number[]> {
                return this.call(OMApi.Messages.getUplinks, docId)
            }

            getDownlink(docId: OMTypes.DocumentId, recId: number): Promise<OMTypes.Downlink> {
                return this.call(OMApi.Messages.getDownlink, {docId, recId})
            }

            insertRecord(docId: OMTypes.DocumentId, recId: number) {
                return this.call(OMApi.Messages.insertRecord,
                    { docId, recId })
            }

            deleteRecord(docId: OMTypes.DocumentId, recId: number) {
                return this.call(OMApi.Messages.deleteRecord,
                    { docId, recId })
            }

            public readonly ui: OMApi.IUI

            call<TType extends string, TReq, TRes>(creator: OMApi.ApiCall<TType, TReq, TRes>, req: TReq): Promise<TRes> {
                const reqMsg = creator.toReq(req)
                return this._channel.sendRequest(reqMsg).then(msg => {
                    const res = creator.fromRes(msg as OMApi.ApiMessage)
                    return res
                })
            }
        }
    }
}