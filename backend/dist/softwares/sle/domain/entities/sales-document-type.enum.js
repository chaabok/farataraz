"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SALES_DOCUMENT_TYPE_LABELS = exports.SalesDocumentType = void 0;
exports.salesDocumentTypeLabel = salesDocumentTypeLabel;
exports.isValidSalesDocumentType = isValidSalesDocumentType;
var SalesDocumentType;
(function (SalesDocumentType) {
    SalesDocumentType[SalesDocumentType["SalesOrder"] = 1] = "SalesOrder";
    SalesDocumentType[SalesDocumentType["SalesProformaInvoice"] = 2] = "SalesProformaInvoice";
    SalesDocumentType[SalesDocumentType["SalesContract"] = 3] = "SalesContract";
    SalesDocumentType[SalesDocumentType["SalesPermit"] = 4] = "SalesPermit";
    SalesDocumentType[SalesDocumentType["SalesInvoice"] = 5] = "SalesInvoice";
    SalesDocumentType[SalesDocumentType["SalesReturnPermit"] = 6] = "SalesReturnPermit";
    SalesDocumentType[SalesDocumentType["SalesReturnInvoice"] = 7] = "SalesReturnInvoice";
})(SalesDocumentType || (exports.SalesDocumentType = SalesDocumentType = {}));
exports.SALES_DOCUMENT_TYPE_LABELS = [
    { value: SalesDocumentType.SalesOrder, label: 'سفارش فروش' },
    { value: SalesDocumentType.SalesProformaInvoice, label: 'پیش فاکتور فروش' },
    { value: SalesDocumentType.SalesContract, label: 'قرارداد فروش' },
    { value: SalesDocumentType.SalesPermit, label: 'مجوز فروش' },
    { value: SalesDocumentType.SalesInvoice, label: 'فاکتور فروش' },
    { value: SalesDocumentType.SalesReturnPermit, label: 'مجوز برگشت از فروش' },
    { value: SalesDocumentType.SalesReturnInvoice, label: 'فاکتور برگشت از فروش' },
];
function salesDocumentTypeLabel(value) {
    const v = Number(value);
    return exports.SALES_DOCUMENT_TYPE_LABELS.find((x) => x.value === v)?.label || 'نامشخص';
}
function isValidSalesDocumentType(value) {
    return exports.SALES_DOCUMENT_TYPE_LABELS.some((x) => x.value === Number(value));
}
//# sourceMappingURL=sales-document-type.enum.js.map