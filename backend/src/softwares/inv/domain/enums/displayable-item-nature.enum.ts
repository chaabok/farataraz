export enum DisplayableItemNature {
  RAW_MATERIAL = 1,  // مواد اولیه
  SEMI_FINISHED = 2, // نیمه ساخته
  PRODUCT = 3,       // محصول
  FIXED_ASSET = 4,   // دارایی ثابت
  WASTE = 5,         // ضایعات
  OTHER = 6,         // سایر
}

export const DISPLAYABLE_ITEM_NATURE_LABELS: Record<DisplayableItemNature, string> = {
  [DisplayableItemNature.RAW_MATERIAL]: 'مواد اولیه',
  [DisplayableItemNature.SEMI_FINISHED]: 'نیمه ساخته',
  [DisplayableItemNature.PRODUCT]: 'محصول',
  [DisplayableItemNature.FIXED_ASSET]: 'دارایی ثابت',
  [DisplayableItemNature.WASTE]: 'ضایعات',
  [DisplayableItemNature.OTHER]: 'سایر',
};
