"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentState = void 0;
var DocumentState;
(function (DocumentState) {
    DocumentState[DocumentState["Note"] = 1] = "Note";
    DocumentState[DocumentState["InitialRegistration"] = 2] = "InitialRegistration";
    DocumentState[DocumentState["UnderReview"] = 3] = "UnderReview";
    DocumentState[DocumentState["Reviewed"] = 4] = "Reviewed";
    DocumentState[DocumentState["Approved"] = 5] = "Approved";
    DocumentState[DocumentState["Cancelled"] = 6] = "Cancelled";
    DocumentState[DocumentState["Restored"] = 7] = "Restored";
    DocumentState[DocumentState["AccountingVoucher"] = 8] = "AccountingVoucher";
    DocumentState[DocumentState["Finalized"] = 9] = "Finalized";
})(DocumentState || (exports.DocumentState = DocumentState = {}));
//# sourceMappingURL=document-state.enum.js.map