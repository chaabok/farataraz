"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingFactorTypeLabels = exports.TrackingFactorType = void 0;
var TrackingFactorType;
(function (TrackingFactorType) {
    TrackingFactorType[TrackingFactorType["SIMPLE_INTEGER"] = 1] = "SIMPLE_INTEGER";
    TrackingFactorType[TrackingFactorType["DECIMAL"] = 2] = "DECIMAL";
    TrackingFactorType[TrackingFactorType["BOOLEAN"] = 3] = "BOOLEAN";
    TrackingFactorType[TrackingFactorType["DATE"] = 4] = "DATE";
    TrackingFactorType[TrackingFactorType["TIME"] = 5] = "TIME";
    TrackingFactorType[TrackingFactorType["TEXT"] = 6] = "TEXT";
    TrackingFactorType[TrackingFactorType["COLOR"] = 7] = "COLOR";
    TrackingFactorType[TrackingFactorType["NUMBER_RANGE"] = 8] = "NUMBER_RANGE";
})(TrackingFactorType || (exports.TrackingFactorType = TrackingFactorType = {}));
exports.TrackingFactorTypeLabels = {
    [TrackingFactorType.SIMPLE_INTEGER]: 'عدد ساده',
    [TrackingFactorType.DECIMAL]: 'عدد اعشاری',
    [TrackingFactorType.BOOLEAN]: 'بولیین',
    [TrackingFactorType.DATE]: 'تاریخ',
    [TrackingFactorType.TIME]: 'ساعت',
    [TrackingFactorType.TEXT]: 'حرفی',
    [TrackingFactorType.COLOR]: 'رنگ',
    [TrackingFactorType.NUMBER_RANGE]: 'بازه اعداد',
};
//# sourceMappingURL=tracking-factor-type.enum.js.map