import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto, PaginatedTransactionsDto } from './dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(page?: number, limit?: number): Promise<PaginatedTransactionsDto>;
    findOne(id: number): Promise<TransactionResponseDto>;
    create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto>;
    update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
