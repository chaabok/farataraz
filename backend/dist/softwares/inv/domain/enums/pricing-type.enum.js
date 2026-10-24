"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRICING_TYPE_OPTIONS = exports.PricingType = void 0;
var PricingType;
(function (PricingType) {
    PricingType[PricingType["Receipt"] = 1] = "Receipt";
    PricingType[PricingType["Issue"] = 2] = "Issue";
})(PricingType || (exports.PricingType = PricingType = {}));
exports.PRICING_TYPE_OPTIONS = [
    { value: PricingType.Receipt, label: 'رسید انبار' },
    { value: PricingType.Issue, label: 'حواله انبار' },
];
//# sourceMappingURL=pricing-type.enum.js.map