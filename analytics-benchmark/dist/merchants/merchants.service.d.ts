import { Pool } from 'pg';
import { CreateMerchantDto, UpdateMerchantDto, MerchantResponseDto, PaginatedMerchantsDto } from './dto';
export declare class MerchantsService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(page?: number, limit?: number): Promise<PaginatedMerchantsDto>;
    findOne(id: number): Promise<MerchantResponseDto>;
    create(createMerchantDto: CreateMerchantDto): Promise<MerchantResponseDto>;
    update(id: number, updateMerchantDto: UpdateMerchantDto): Promise<MerchantResponseDto>;
    remove(id: number): Promise<void>;
}
