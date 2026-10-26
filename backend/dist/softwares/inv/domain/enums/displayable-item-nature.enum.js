"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISPLAYABLE_ITEM_NATURE_LABELS = exports.DisplayableItemNature = void 0;
var DisplayableItemNature;
(function (DisplayableItemNature) {
    DisplayableItemNature[DisplayableItemNature["RAW_MATERIAL"] = 1] = "RAW_MATERIAL";
    DisplayableItemNature[DisplayableItemNature["SEMI_FINISHED"] = 2] = "SEMI_FINISHED";
    DisplayableItemNature[DisplayableItemNature["PRODUCT"] = 3] = "PRODUCT";
    DisplayableItemNature[DisplayableItemNature["FIXED_ASSET"] = 4] = "FIXED_ASSET";
    DisplayableItemNature[DisplayableItemNature["WASTE"] = 5] = "WASTE";
    DisplayableItemNature[DisplayableItemNature["OTHER"] = 6] = "OTHER";
})(DisplayableItemNature || (exports.DisplayableItemNature = DisplayableItemNature = {}));
exports.DISPLAYABLE_ITEM_NATURE_LABELS = {
    [DisplayableItemNature.RAW_MATERIAL]: 'مواد اولیه',
    [DisplayableItemNature.SEMI_FINISHED]: 'نیمه ساخته',
    [DisplayableItemNature.PRODUCT]: 'محصول',
    [DisplayableItemNature.FIXED_ASSET]: 'دارایی ثابت',
    [DisplayableItemNature.WASTE]: 'ضایعات',
    [DisplayableItemNature.OTHER]: 'سایر',
};
//# sourceMappingURL=displayable-item-nature.enum.js.map