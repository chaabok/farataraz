"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxAndDutyExemption = exports.PricingMethod = exports.ItemType = void 0;
var ItemType;
(function (ItemType) {
    ItemType[ItemType["GOODS"] = 1] = "GOODS";
    ItemType[ItemType["SERVICE"] = 2] = "SERVICE";
})(ItemType || (exports.ItemType = ItemType = {}));
var PricingMethod;
(function (PricingMethod) {
    PricingMethod[PricingMethod["WEIGHTED_AVERAGE"] = 1] = "WEIGHTED_AVERAGE";
    PricingMethod[PricingMethod["FIFO"] = 2] = "FIFO";
    PricingMethod[PricingMethod["LIFO"] = 3] = "LIFO";
    PricingMethod[PricingMethod["STANDARD_RATE"] = 4] = "STANDARD_RATE";
})(PricingMethod || (exports.PricingMethod = PricingMethod = {}));
var TaxAndDutyExemption;
(function (TaxAndDutyExemption) {
    TaxAndDutyExemption[TaxAndDutyExemption["NONE"] = 1] = "NONE";
    TaxAndDutyExemption[TaxAndDutyExemption["SALE_EXEMPT"] = 2] = "SALE_EXEMPT";
    TaxAndDutyExemption[TaxAndDutyExemption["PURCHASE_EXEMPT"] = 3] = "PURCHASE_EXEMPT";
    TaxAndDutyExemption[TaxAndDutyExemption["BOTH_EXEMPT"] = 4] = "BOTH_EXEMPT";
})(TaxAndDutyExemption || (exports.TaxAndDutyExemption = TaxAndDutyExemption = {}));
//# sourceMappingURL=item.enums.js.map