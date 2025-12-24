export declare class CreateTransactionDto {
    customer_id: number;
    merchant_id: number;
    amount: number;
    status?: string;
}
export declare class UpdateTransactionDto {
    customer_id?: number;
    merchant_id?: number;
    amount?: number;
    status?: string;
}
export declare class TransactionResponseDto {
    transaction_id: number;
    customer_id: number;
    merchant_id: number;
    amount: number;
    status: string;
    transaction_time: Date;
}
export declare class PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class PaginatedTransactionsDto {
    data: TransactionResponseDto[];
    meta: PaginationMeta;
}
