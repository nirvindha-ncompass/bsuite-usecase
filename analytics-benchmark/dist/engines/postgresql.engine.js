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
exports.PostgresqlEngine = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const database_module_1 = require("../database/database.module");
let PostgresqlEngine = class PostgresqlEngine {
    constructor(pool) {
        this.pool = pool;
    }
    async executeQuery(query, params = []) {
        const startTime = Date.now();
        const result = await this.pool.query(query, params);
        const executionTimeMs = Date.now() - startTime;
        return {
            data: result.rows,
            executionTimeMs,
            rowCount: result.rowCount,
        };
    }
    async getRevenueByMerchant(limit) {
        const query = `
      SELECT 
        m.merchant_id,
        m.merchant_name,
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.status = 'completed'
      GROUP BY m.merchant_id, m.merchant_name, m.category
      ORDER BY total_revenue DESC
    `;
        const startTime = Date.now();
        const result = await this.pool.query(query);
        const executionTimeMs = Date.now() - startTime;
        return {
            data: result.rows,
            executionTimeMs,
            rowCount: result.rowCount,
            engine: 'postgresql-local',
            query: query.trim(),
        };
    }
    async getDailyTransactions(days) {
        const query = `
      SELECT 
        DATE(transaction_time) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM transactions
      GROUP BY DATE(transaction_time)
      ORDER BY date DESC
    `;
        const startTime = Date.now();
        const result = await this.pool.query(query);
        const executionTimeMs = Date.now() - startTime;
        return {
            data: result.rows,
            executionTimeMs,
            rowCount: result.rowCount,
            engine: 'postgresql-local',
            query: query.trim(),
        };
    }
    async getCustomerSpending(limit) {
        const query = `
      SELECT 
        c.customer_id,
        c.name,
        c.email,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_spent,
        AVG(t.amount) as avg_transaction,
        MIN(t.transaction_time) as first_transaction,
        MAX(t.transaction_time) as last_transaction
      FROM customers c
      JOIN transactions t ON c.customer_id = t.customer_id
      WHERE t.status = 'completed'
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_spent DESC
    `;
        const startTime = Date.now();
        const result = await this.pool.query(query);
        const executionTimeMs = Date.now() - startTime;
        return {
            data: result.rows,
            executionTimeMs,
            rowCount: result.rowCount,
            engine: 'postgresql-local',
            query: query.trim(),
        };
    }
    async getCategoryDistribution() {
        const query = `
      SELECT 
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        COUNT(DISTINCT t.merchant_id) as merchant_count,
        ROUND(COUNT(t.transaction_id) * 100.0 / SUM(COUNT(t.transaction_id)) OVER (), 2) as percentage
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `;
        const startTime = Date.now();
        const result = await this.pool.query(query);
        const executionTimeMs = Date.now() - startTime;
        return {
            data: result.rows,
            executionTimeMs,
            rowCount: result.rowCount,
            engine: 'postgresql-local',
            query: query.trim(),
        };
    }
    async getStatusSummary() {
        const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM transactions
      GROUP BY status
      ORDER BY count DESC
    `;
        const startTime = Date.now();
        const result = await this.pool.query(query);
        const executionTimeMs = Date.now() - startTime;
        return {
            data: result.rows,
            executionTimeMs,
            rowCount: result.rowCount,
            engine: 'postgresql-local',
            query: query.trim(),
        };
    }
};
exports.PostgresqlEngine = PostgresqlEngine;
exports.PostgresqlEngine = PostgresqlEngine = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DATABASE_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], PostgresqlEngine);
//# sourceMappingURL=postgresql.engine.js.map