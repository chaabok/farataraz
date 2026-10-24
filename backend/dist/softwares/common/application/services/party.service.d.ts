import { Repository } from 'typeorm';
import { IPartyRepository } from '../../domain/repositories/party.repository.interface';
import { Party } from '../../domain/entities/party.entity';
import { PartyRelated } from '../../domain/entities/party-related.entity';
import { PartyAddress } from '../../domain/entities/party-address.entity';
import { PartyPhone } from '../../domain/entities/party-phone.entity';
import { CreatePartyDto } from '../dtos/create-party.dto';
import { UpdatePartyDto } from '../dtos/update-party.dto';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { DetailedAccountsNumberingService } from '../../application/services/detailed-accounts-numbering.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class PartyService {
    private readonly partyRepository;
    private readonly partyRelatedRepository;
    private readonly partyAddressRepository;
    private readonly partyPhoneRepository;
    private readonly detailedAccountService;
    private readonly detailedAccountsNumberingService;
    private readonly detailedTypeService;
    private readonly idGenerationService;
    constructor(partyRepository: IPartyRepository, partyRelatedRepository: Repository<PartyRelated>, partyAddressRepository: Repository<PartyAddress>, partyPhoneRepository: Repository<PartyPhone>, detailedAccountService: DetailedAccountService, detailedAccountsNumberingService: DetailedAccountsNumberingService, detailedTypeService: DetailedTypeService, idGenerationService: IdGenerationService);
    private withDetailedCode;
    private validateDuplicates;
    create(createDto: CreatePartyDto): Promise<Party>;
    update(id: number, updateDto: UpdatePartyDto): Promise<Party>;
    findOne(id: number): Promise<any>;
    findAll(options?: any): Promise<Party[]>;
    findWithPagination(params: any): Promise<{
        items: Party[];
        total: number;
    }>;
    remove(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
