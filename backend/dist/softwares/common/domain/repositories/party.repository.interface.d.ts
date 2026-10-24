import { Party } from '../entities/party.entity';
export declare const IPartyRepositoryToken: unique symbol;
export interface IPartyRepository {
    create(data: Partial<Party>): Promise<Party>;
    update(id: number, data: Partial<Party>): Promise<Party>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Party | null>;
    findAll(options?: any): Promise<Party[]>;
    findAdvanced(params: any): Promise<[Party[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findDuplicatesByFullName(firstName: string, lastName: string, excludeId?: number): Promise<boolean>;
}
