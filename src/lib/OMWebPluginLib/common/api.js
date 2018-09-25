"use strict";
var OMWebPluginLib;
(function (OMWebPluginLib) {
    /** API types
     */
    var OMApi;
    (function (OMApi) {
        var FieldValueType;
        (function (FieldValueType) {
            //Def_Type = 0,
            FieldValueType[FieldValueType["String"] = 1] = "String";
            FieldValueType[FieldValueType["Number"] = 2] = "Number";
            FieldValueType[FieldValueType["DateTime"] = 3] = "DateTime";
            FieldValueType[FieldValueType["TimeSpan"] = 4] = "TimeSpan";
            FieldValueType[FieldValueType["ObjectId"] = 5] = "ObjectId";
            FieldValueType[FieldValueType["Blob"] = 6] = "Blob";
            FieldValueType[FieldValueType["Bits64"] = 7] = "Bits64";
        })(FieldValueType = OMApi.FieldValueType || (OMApi.FieldValueType = {}));
        function stringField(value, fieldId, recordId) {
            return {
                valueType: FieldValueType.String,
                fieldId: { id: fieldId, recordId: recordId },
                value: value
            };
        }
        OMApi.stringField = stringField;
        function intField(value, fieldId, recordId) {
            return {
                valueType: FieldValueType.Number,
                fieldId: { id: fieldId, recordId: recordId },
                value: value
            };
        }
        OMApi.intField = intField;
        function _dateTimeField(value, fieldId, recordId) {
            return {
                valueType: FieldValueType.DateTime,
                fieldId: { id: fieldId, recordId: recordId },
                value: value
            };
        }
        /** Returns new DateTimeField object
         * @param value
         *      Date: object created by new Date(...)
         *      string: preferably ISO format but general any format accepted by new Date(...)
         *      number: a number representing the milliseconds elapsed between 1 January 1970 00:00:00 UTC and the given date (see Date.prototype.getTime)
         * @param fieldId
         * @param recordId
         */
        function dateTimeField(value, fieldId, recordId) {
            if (value instanceof Date) {
                return _dateTimeField(value.toISOString(), fieldId, recordId);
            }
            else if (typeof value === 'string') {
                return _dateTimeField((new Date(value)).toISOString(), fieldId, recordId);
            }
            else if (typeof value === 'number') {
                return _dateTimeField((new Date(value)).toISOString(), fieldId, recordId);
            }
            throw new TypeError('Unexpected date time field value');
        }
        OMApi.dateTimeField = dateTimeField;
        /** Returns new TimeSpanField object
         * @param milliSec a number of milliseconds
         * @param fieldId
         * @param recordId
         */
        function timeSpanField(milliSec, fieldId, recordId) {
            return {
                valueType: FieldValueType.TimeSpan,
                fieldId: { id: fieldId, recordId: recordId },
                value: milliSec
            };
        }
        OMApi.timeSpanField = timeSpanField;
        //export interface IDocument {
        //    setFields(fields: ReadonlyArray<Field>): Promise<void>
        //}
        function encodeDocumentId(documentId) {
            //String.Format("<{0},{1},{2}>", PoolID, PinnID, SystemID);
            var raw = "<" + documentId.poolId + "," + documentId.lowId + "," + documentId.systemId + ">";
            var encoded = btoa(raw);
            return encoded;
        }
        OMApi.encodeDocumentId = encodeDocumentId;
    })(OMApi = OMWebPluginLib.OMApi || (OMWebPluginLib.OMApi = {}));
    /** API calls
     */
    (function (OMApi) {
        OMApi.Module = 'api';
        function isApiMessage(msg) {
            return typeof msg === 'object' && typeof msg.json === 'string';
        }
        OMApi.isApiMessage = isApiMessage;
        var ApiCall = /** @class */ (function () {
            function ApiCall(type) {
                this.type = type;
            }
            ApiCall.prototype.toReq = function (req) {
                return {
                    module: OMApi.Module,
                    type: this.type,
                    json: JSON.stringify(req)
                };
            };
            ApiCall.prototype.fromReq = function (reqMsg) {
                var req = JSON.parse(reqMsg.json);
                return req;
            };
            ApiCall.prototype.fromRes = function (msg) {
                var res = JSON.parse(msg.json);
                return res;
            };
            ApiCall.prototype.toRes = function (res) {
                return {
                    module: OMApi.Module,
                    type: this.type,
                    json: JSON.stringify(res)
                };
            };
            return ApiCall;
        }());
        OMApi.ApiCall = ApiCall;
        OMApi.Messages = {
            createDocument: new ApiCall('createDocument'),
            createDocumentEx: new ApiCall('createDocumentEx'),
            getFields: new ApiCall('getFields'),
            setFields: new ApiCall('setFields'),
            getCurrentDocumentId: new ApiCall('getCurrentDocumentId'),
            getCurrentUser: new ApiCall('getCurrentUser'),
            linkToNew: new ApiCall('linkToNew'),
            openDocument: new ApiCall('openDocument'),
            getCurrentContext: new ApiCall('getCurrentContext'),
            getRecordIds: new ApiCall('getRecordIds'),
            setDownlink: new ApiCall('setDownlink'),
            getUplinks: new ApiCall('getUplinks'),
            getDownlink: new ApiCall('getDownlink'),
            insertRecord: new ApiCall('insertRecord'),
            deleteRecord: new ApiCall('deleteRecord')
        };
    })(OMApi = OMWebPluginLib.OMApi || (OMWebPluginLib.OMApi = {}));
})(OMWebPluginLib || (OMWebPluginLib = {}));
//# sourceMappingURL=api.js.map