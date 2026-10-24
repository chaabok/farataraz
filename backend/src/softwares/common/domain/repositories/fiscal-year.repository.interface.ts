export interface IFiscalYearRepository {
  create(data: Partial<any>): Promise<any>;
  update(id: number, data: Partial<any>): Promise<any>;
  findById(id: number): Promise<any>;
  findAll(): Promise<any[]>;
  findWithPagination(skip: number, take: number): Promise<[any[], number]>;
  findAdvanced(params: any): Promise<[any[], number]>;
  findByTitle(title: string): Promise<any>;
  delete(id: number): Promise<void>;
}
