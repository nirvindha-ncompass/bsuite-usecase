import { Pool } from 'pg';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto, PaginatedCustomersDto } from './dto';
export declare class CustomersService {
    private readonly pool;
    constructor(pool: Pool);
    findAll(page?: number, limit?: number): Promise<PaginatedCustomersDto>;
    findOne(id: number): Promise<CustomerResponseDto>;
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto>;
    remove(id: number): Promise<void>;
}
