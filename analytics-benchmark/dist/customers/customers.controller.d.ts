import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto, PaginatedCustomersDto } from './dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(page?: number, limit?: number): Promise<PaginatedCustomersDto>;
    findOne(id: number): Promise<CustomerResponseDto>;
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
