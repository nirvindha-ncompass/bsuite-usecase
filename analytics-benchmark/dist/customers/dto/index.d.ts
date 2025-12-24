export declare class CreateCustomerDto {
    name: string;
    email: string;
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
}
export declare class CustomerResponseDto {
    customer_id: number;
    name: string;
    email: string;
    created_at: Date;
}
export declare class PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class PaginatedCustomersDto {
    data: CustomerResponseDto[];
    meta: PaginationMeta;
}
