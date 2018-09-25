"use strict";
var OMWebPluginLib;
(function (OMWebPluginLib) {
    var Host;
    (function (Host) {
        var ApiModule = /** @class */ (function () {
            function ApiModule(channel) {
                var _this = this;
                this._channel = channel;
                this.ui = {
                    linkToNew: function (downlinkId, templateId) {
                        return _this.call(OMWebPluginLib.OMApi.Messages.linkToNew, { downlinkId: downlinkId, templateId: templateId });
                    },
                    openDocument: function (docId, options) {
                        return _this.call(OMWebPluginLib.OMApi.Messages.openDocument, { docId: docId, options: options });
                    }
                };
            }
            ApiModule.prototype.createDocument = function (templateId, folderLoId, poolId, systemId) {
                return this.call(OMWebPluginLib.OMApi.Messages.createDocument, { templateId: templateId, folderLoId: folderLoId, poolId: poolId, systemId: systemId });
            };
            ApiModule.prototype.createDocumentEx = function (templateId, folder, fields) {
                return this.call(OMWebPluginLib.OMApi.Messages.createDocumentEx, { templateId: templateId, folder: folder, fields: fields });
            };
            ApiModule.prototype.getFields = function (docId, fieldIds) {
                return this.call(OMWebPluginLib.OMApi.Messages.getFields, { docId: docId, fieldIds: fieldIds });
            };
            ApiModule.prototype.setFields = function (docId, fields) {
                return this.call(OMWebPluginLib.OMApi.Messages.setFields, { docId: docId, fields: fields });
            };
            ApiModule.prototype.getCurrentDocumentId = function () {
                return this.call(OMWebPluginLib.OMApi.Messages.getCurrentDocumentId, null);
            };
            ApiModule.prototype.getCurrentUser = function () {
                return this.call(OMWebPluginLib.OMApi.Messages.getCurrentUser, null);
            };
            ApiModule.prototype.getCurrentContext = function () {
                return this.call(OMWebPluginLib.OMApi.Messages.getCurrentContext, null);
            };
            ApiModule.prototype.getRecordIds = function (docId) {
                return this.call(OMWebPluginLib.OMApi.Messages.getRecordIds, docId);
            };
            ApiModule.prototype.setDownlink = function (docId, recId, linkId) {
                return this.call(OMWebPluginLib.OMApi.Messages.setDownlink, { docId: docId, recId: recId, linkId: linkId });
            };
            ApiModule.prototype.getUplinks = function (docId) {
                return this.call(OMWebPluginLib.OMApi.Messages.getUplinks, docId);
            };
            ApiModule.prototype.getDownlink = function (docId, recId) {
                return this.call(OMWebPluginLib.OMApi.Messages.getDownlink, { docId: docId, recId: recId });
            };
            ApiModule.prototype.insertRecord = function (docId, recId) {
                return this.call(OMWebPluginLib.OMApi.Messages.insertRecord, { docId: docId, recId: recId });
            };
            ApiModule.prototype.deleteRecord = function (docId, recId) {
                return this.call(OMWebPluginLib.OMApi.Messages.deleteRecord, { docId: docId, recId: recId });
            };
            ApiModule.prototype.call = function (creator, req) {
                var reqMsg = creator.toReq(req);
                return this._channel.sendRequest(reqMsg).then(function (msg) {
                    var res = creator.fromRes(msg);
                    return res;
                });
            };
            return ApiModule;
        }());
        Host.ApiModule = ApiModule;
    })(Host = OMWebPluginLib.Host || (OMWebPluginLib.Host = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=api.js.map