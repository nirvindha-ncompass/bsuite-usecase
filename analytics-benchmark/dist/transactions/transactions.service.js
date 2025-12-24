"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
let TransactionsService = class TransactionsService {
    constructor(pool) {
        this.pool = pool;
    }
    async findAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const countResult = await this.pool.query('SELECT COUNT(*) FROM transactions');
        const total = parseInt(countResult.rows[0].count, 10);
        const result = await this.pool.query('SELECT * FROM transactions ORDER BY transaction_id DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return {
            data: result.rows,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const result = await this.pool.query('SELECT * FROM transactions WHERE transaction_id = $1', [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        return result.rows[0];
    }
    async create(createTransactionDto) {
        const { customer_id, merchant_id, amount, status } = createTransactionDto;
        const result = await this.pool.query(`INSERT INTO transactions (customer_id, merchant_id, amount, status, transaction_time) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`, [customer_id, merchant_id, amount, status || 'completed']);
        return result.rows[0];
    }
    async update(id, updateTransactionDto) {
        const { customer_id, merchant_id, amount, status } = updateTransactionDto;
        const result = await this.pool.query(`UPDATE transactions 
       SET customer_id = COALESCE($1, customer_id), 
           merchant_id = COALESCE($2, merchant_id),
           amount = COALESCE($3, amount),
           status = COALESCE($4, status)
       WHERE transaction_id = $5
       RETURNING *`, [customer_id, merchant_id, amount, status, id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        return result.rows[0];
    }
    async remove(id) {
        const result = await this.pool.query('DELETE FROM transactions WHERE transaction_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map