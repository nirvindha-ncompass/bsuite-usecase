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
exports.ClickhouseLocalEngine = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ClickhouseLocalEngine = class ClickhouseLocalEngine {
    constructor(configService) {
        this.configService = configService;
        this.client = null;
        this.isAvailable = false;
        const dbConfig = {
            host: '192.168.101.23',
            port: this.configService.get('database.port') || 5432,
            name: this.configService.get('database.name') || 'datastuff',
            user: this.configService.get('database.user') || 'postgres',
            password: this.configService.get('database.password') || 'Password',
        };
        this.pgConnectionString = `'${dbConfig.host}:${dbConfig.port}', '${dbConfig.name}', '%TABLE%', '${dbConfig.user}', '${dbConfig.password}'`;
    }
    async onModuleInit() {
        await this.initializeClient();
    }
    async initializeClient() {
        try {
            const { ClickHouse } = require('clickhouse');
            const clickhouseHost = 'localhost';
            const clickhousePort = 8124;
            this.client = new ClickHouse({
                url: `http://${clickhouseHost}`,
                port: clickhousePort,
                debug: false,
                basicAuth: null,
                isUseGzip: false,
                format: 'json',
                config: {
                    session_timeout: 600,
                    output_format_json_quote_64bit_integers: 0,
                    enable_http_compression: 0,
                },
            });
            await this.client.query('SELECT 1').toPromise();
            this.isAvailable = true;
        }
        catch (error) {
            console.warn('⚠️ ClickHouse Local (WSL) not available:', error);
            this.isAvailable = false;
        }
    }
    getPgTable(tableName) {
        return this.pgConnectionString.replace('%TABLE%', tableName);
    }
    notAvailableResponse() {
        return {
            data: [],
            executionTimeMs: 0,
            rowCount: 0,
        };
    }
    async executeQuery(query, params = []) {
        if (!this.isAvailable || !this.client) {
            return this.notAvailableResponse();
        }
        const startTime = Date.now();
        try {
            const result = await this.client.query(query).toPromise();
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result,
                executionTimeMs,
                rowCount: result.length,
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
            };
        }
    }
    async getRevenueByMerchant(limit) {
        if (!this.isAvailable || !this.client) {
            return this.notAvailableResponse();
        }
        const transactionsPg = this.getPgTable('transactions');
        const merchantsPg = this.getPgTable('merchants');
        const query = `
      SELECT 
        m.merchant_id,
        m.merchant_name,
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction
      FROM postgresql(${transactionsPg}) AS t
      JOIN postgresql(${merchantsPg}) AS m ON t.merchant_id = m.merchant_id
      WHERE t.status = 'completed'
      GROUP BY m.merchant_id, m.merchant_name, m.category
      ORDER BY total_revenue DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.client.query(query).toPromise();
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result,
                executionTimeMs,
                rowCount: result.length,
                engine: 'clickhouse-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'clickhouse-local',
                error: error.message,
            };
        }
    }
    async getDailyTransactions(days) {
        if (!this.isAvailable || !this.client) {
            return this.notAvailableResponse();
        }
        const transactionsPg = this.getPgTable('transactions');
        const query = `
      SELECT 
        toDate(transaction_time) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM postgresql(${transactionsPg})
      GROUP BY toDate(transaction_time)
      ORDER BY date DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.client.query(query).toPromise();
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result,
                executionTimeMs,
                rowCount: result.length,
                engine: 'clickhouse-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'clickhouse-local',
                error: error.message,
            };
        }
    }
    async getCustomerSpending(limit) {
        if (!this.isAvailable || !this.client) {
            return this.notAvailableResponse();
        }
        const transactionsPg = this.getPgTable('transactions');
        const customersPg = this.getPgTable('customers');
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
      FROM postgresql(${customersPg}) AS c
      JOIN postgresql(${transactionsPg}) AS t ON c.customer_id = t.customer_id
      WHERE t.status = 'completed'
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_spent DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.client.query(query).toPromise();
            const executionTimeMs = Date.now() - startTime;
            return {
                data: result,
                executionTimeMs,
                rowCount: result.length,
                engine: 'clickhouse-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'clickhouse-local',
                error: error.message,
            };
        }
    }
    async getCategoryDistribution() {
        if (!this.isAvailable || !this.client) {
            return this.notAvailableResponse();
        }
        const transactionsPg = this.getPgTable('transactions');
        const merchantsPg = this.getPgTable('merchants');
        const query = `
      SELECT 
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        COUNT(DISTINCT t.merchant_id) as merchant_count
      FROM postgresql(${transactionsPg}) AS t
      JOIN postgresql(${merchantsPg}) AS m ON t.merchant_id = m.merchant_id
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.client.query(query).toPromise();
            const executionTimeMs = Date.now() - startTime;
            const totalTransactions = result.reduce((sum, row) => sum + Number(row.transaction_count), 0);
            const dataWithPercentage = result.map((row) => ({
                ...row,
                percentage: totalTransactions > 0 ? ((Number(row.transaction_count) / totalTransactions) * 100).toFixed(2) : '0',
            }));
            return {
                data: dataWithPercentage,
                executionTimeMs,
                rowCount: result.length,
                engine: 'clickhouse-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'clickhouse-local',
                error: error.message,
            };
        }
    }
    async getStatusSummary() {
        if (!this.isAvailable || !this.client) {
            return this.notAvailableResponse();
        }
        const transactionsPg = this.getPgTable('transactions');
        const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM postgresql(${transactionsPg})
      GROUP BY status
      ORDER BY count DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.client.query(query).toPromise();
            const executionTimeMs = Date.now() - startTime;
            const totalCount = result.reduce((sum, row) => sum + Number(row.count), 0);
            const dataWithPercentage = result.map((row) => ({
                ...row,
                percentage: totalCount > 0 ? ((Number(row.count) / totalCount) * 100).toFixed(2) : '0',
            }));
            return {
                data: dataWithPercentage,
                executionTimeMs,
                rowCount: result.length,
                engine: 'clickhouse-local',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'clickhouse-local',
                error: error.message,
            };
        }
    }
};
exports.ClickhouseLocalEngine = ClickhouseLocalEngine;
exports.ClickhouseLocalEngine = ClickhouseLocalEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ClickhouseLocalEngine);
//# sourceMappingURL=clickhouse-local.engine.js.map