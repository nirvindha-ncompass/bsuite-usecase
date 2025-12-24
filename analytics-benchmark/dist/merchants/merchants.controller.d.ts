import { MerchantsService } from './merchants.service';
import { CreateMerchantDto, UpdateMerchantDto, MerchantResponseDto, PaginatedMerchantsDto } from './dto';
export declare class MerchantsController {
    private readonly merchantsService;
    constructor(merchantsService: MerchantsService);
    findAll(page?: number, limit?: number): Promise<PaginatedMerchantsDto>;
    findOne(id: number): Promise<MerchantResponseDto>;
    create(createMerchantDto: CreateMerchantDto): Promise<MerchantResponseDto>;
    update(id: number, updateMerchantDto: UpdateMerchantDto): Promise<MerchantResponseDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
