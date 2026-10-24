export enum WarehouseDocumentNature {
  INCREASING = 1, // افزاینده
  DECREASING = 2, // کاهنده
  NEUTRAL = 3,    // خنثی
}

export const WAREHOUSE_DOCUMENT_NATURE_LABELS: Record<WarehouseDocumentNature, string> = {
  [WarehouseDocumentNature.INCREASING]: 'افزاینده',
  [WarehouseDocumentNature.DECREASING]: 'کاهنده',
  [WarehouseDocumentNature.NEUTRAL]: 'خنثی',
};
