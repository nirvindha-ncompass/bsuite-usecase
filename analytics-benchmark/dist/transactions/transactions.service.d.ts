import { Pool } from 'pg';
import { CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto, PaginatedTransactionsDto } from './dto';
export declare class TransactionsService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(page?: number, limit?: number): Promise<PaginatedTransactionsDto>;
    findOne(id: number): Promise<TransactionResponseDto>;
    create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto>;
    update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto>;
    remove(id: number): Promise<void>;
}
