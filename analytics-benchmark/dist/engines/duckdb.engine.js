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
exports.DuckdbEngine = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let DuckdbEngine = class DuckdbEngine {
    constructor(configService) {
        this.configService = configService;
        this.db = null;
        this.connection = null;
        this.isAvailable = false;
        this.initPromise = null;
        const dbConfig = {
            host: this.configService.get('database.host'),
            port: this.configService.get('database.port'),
            name: this.configService.get('database.name'),
            user: this.configService.get('database.user'),
            password: this.configService.get('database.password'),
        };
        this.connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`;
        this.initPromise = this.initializeDatabase();
    }
    async initializeDatabase() {
        try {
            const duckdb = require('duckdb');
            this.db = new duckdb.Database(':memory:');
            this.connection = this.db.connect();
            await this.runQuery("INSTALL postgres;");
            await this.runQuery("LOAD postgres;");
            const attachQuery = `ATTACH '${this.connectionString}' AS pg (TYPE postgres, READ_ONLY);`;
            await this.runQuery(attachQuery);
            this.isAvailable = true;
        }
        catch (error) {
            console.warn('⚠️ DuckDB not available:', error.message);
            this.isAvailable = false;
        }
    }
    runQuery(query) {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject(new Error('DuckDB connection not available'));
                return;
            }
            this.connection.all(query, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result || []);
                }
            });
        });
    }
    convertBigInts(data) {
        return data.map(row => {
            const converted = {};
            for (const key of Object.keys(row)) {
                const value = row[key];
                if (typeof value === 'bigint') {
                    converted[key] = Number.isSafeInteger(Number(value))
                        ? Number(value)
                        : value.toString();
                }
                else if (value instanceof Date) {
                    converted[key] = value.toISOString();
                }
                else {
                    converted[key] = value;
                }
            }
            return converted;
        });
    }
    async ensureInitialized() {
        if (this.initPromise) {
            await this.initPromise;
        }
    }
    notAvailableResponse() {
        return {
            data: [],
            executionTimeMs: 0,
            rowCount: 0,
            engine: 'duckdb-local',
            error: 'DuckDB not available. Check installation.',
        };
    }
    async executeQuery(query, params = []) {
        await this.ensureInitialized();
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const startTime = Date.now();
        const result = await this.runQuery(query);
        const executionTimeMs = Date.now() - startTime;
        return {
            data: this.convertBigInts(result),
            executionTimeMs,
            rowCount: result.length,
        };
    }
    async getRevenueByMerchant(limit) {
        await this.ensureInitialized();
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
      FROM pg.public.transactions t
      JOIN pg.public.merchants m ON t.merchant_id = m.merchant_id
      WHERE t.status = 'completed'
      GROUP BY m.merchant_id, m.merchant_name, m.category
      ORDER BY total_revenue DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQuery(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-local',
                error: error.message,
            };
        }
    }
    async getDailyTransactions(days) {
        await this.ensureInitialized();
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const query = `
      SELECT 
        CAST(transaction_time AS DATE) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM pg.public.transactions
      GROUP BY CAST(transaction_time AS DATE)
      ORDER BY date DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQuery(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-local',
                error: error.message,
            };
        }
    }
    async getCustomerSpending(limit) {
        await this.ensureInitialized();
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
      FROM pg.public.customers c
      JOIN pg.public.transactions t ON c.customer_id = t.customer_id
      WHERE t.status = 'completed'
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_spent DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQuery(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-local',
                error: error.message,
            };
        }
    }
    async getCategoryDistribution() {
        await this.ensureInitialized();
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
      FROM pg.public.transactions t
      JOIN pg.public.merchants m ON t.merchant_id = m.merchant_id
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQuery(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-local',
                error: error.message,
            };
        }
    }
    async getStatusSummary() {
        await this.ensureInitialized();
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
      FROM pg.public.transactions
      GROUP BY status
      ORDER BY count DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQuery(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-local',
                error: error.message,
            };
        }
    }
};
exports.DuckdbEngine = DuckdbEngine;
exports.DuckdbEngine = DuckdbEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DuckdbEngine);
//# sourceMappingURL=duckdb.engine.js.map