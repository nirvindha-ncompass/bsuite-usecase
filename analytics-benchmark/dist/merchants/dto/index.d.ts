export declare class CreateMerchantDto {
    merchant_name: string;
    category: string;
}
export declare class UpdateMerchantDto {
    merchant_name?: string;
    category?: string;
}
export declare class MerchantResponseDto {
    merchant_id: number;
    merchant_name: string;
    category: string;
    created_at: Date;
}
export declare class PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class PaginatedMerchantsDto {
    data: MerchantResponseDto[];
    meta: PaginationMeta;
}
