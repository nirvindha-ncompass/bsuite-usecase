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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresqlDockerEngine = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
let PostgresqlDockerEngine = class PostgresqlDockerEngine {
    constructor(configService) {
        this.configService = configService;
        this.isAvailable = false;
    }
    async onModuleInit() {
        try {
            this.pool = new pg_1.Pool({
                host: 'postgres-docker',
                port: 5432,
                database: 'datastuff',
                user: 'postgres',
                password: 'Password',
            });
            const client = await this.pool.connect();
            client.release();
            this.isAvailable = true;
        }
        catch (error) {
            console.warn('⚠️ PostgreSQL Docker not available:', error.message);
            this.isAvailable = false;
        }
    }
    notAvailableResponse() {
        return {
            data: [],
            executionTimeMs: 0,
            rowCount: 0,
            engine: 'postgresql-docker',
            error: 'PostgreSQL Docker not available. Run: docker-compose up -d',
        };
    }
    async executeQuery(query, params = []) {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
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
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
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
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
    async getDailyTransactions(days) {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
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
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
    async getCustomerSpending(limit) {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
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
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
    async getCategoryDistribution() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
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
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
    async getStatusSummary() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
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
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
    async getSimple1M() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const query = `SELECT * FROM transactions LIMIT 1000000`;
        const startTime = Date.now();
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
    async getSimple5() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const query = `SELECT * FROM transactions LIMIT 5`;
        const startTime = Date.now();
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
    async getSimple100K() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const query = `SELECT * FROM transactions LIMIT 100000`;
        const startTime = Date.now();
        try {
            const result = await this.pool.query(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result.rows,
                executionTimeMs,
                rowCount: result.rowCount,
                engine: 'postgresql-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'postgresql-docker',
                error: error.message,
            };
        }
    }
};
exports.PostgresqlDockerEngine = PostgresqlDockerEngine;
exports.PostgresqlDockerEngine = PostgresqlDockerEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PostgresqlDockerEngine);
//# sourceMappingURL=postgresql-docker.engine.js.map