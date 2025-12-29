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
exports.DuckdbDockerEngine = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let DuckdbDockerEngine = class DuckdbDockerEngine {
    constructor(configService) {
        this.configService = configService;
        this.isAvailable = false;
    }
    async onModuleInit() {
        try {
            await execAsync('docker ps --filter "name=analytics-duckdb-docker" --format "{{.Names}}"');
            this.isAvailable = true;
        }
        catch (error) {
            console.warn('⚠️ DuckDB Docker container not found:', error.message);
            this.isAvailable = false;
        }
    }
    notAvailableResponse() {
        return {
            data: [],
            executionTimeMs: 0,
            rowCount: 0,
            engine: 'duckdb-docker',
            error: 'DuckDB Docker container not available. Run: docker-compose up -d',
        };
    }
    async runQueryInDocker(query) {
        const fullSql = `
      INSTALL postgres;
      LOAD postgres;
      ATTACH 'dbname=datastuff user=postgres password=Password host=postgres-docker port=5432' AS pg (TYPE postgres);
      ${query}
    `;
        const { spawn } = require('child_process');
        return new Promise((resolve, reject) => {
            const child = spawn('docker', ['exec', '-i', 'analytics-duckdb-docker', 'duckdb', '-json']);
            let stdoutData = '';
            let stderrData = '';
            child.stdout.on('data', (chunk) => {
                stdoutData += chunk;
            });
            child.stderr.on('data', (chunk) => {
                stderrData += chunk;
            });
            child.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Docker Exec Error (Exit Code ${code}): ${stderrData}`));
                    return;
                }
                try {
                    if (!stdoutData.trim()) {
                        resolve([]);
                        return;
                    }
                    const result = JSON.parse(stdoutData);
                    resolve(result);
                }
                catch (e) {
                    reject(new Error(`Failed to parse DuckDB output: ${e.message}`));
                }
            });
            child.on('error', (err) => {
                reject(new Error(`Spawn Error: ${err.message}`));
            });
            child.stdin.write(fullSql);
            child.stdin.end();
        });
    }
    convertBigInts(data) {
        return data.map(row => {
            const converted = {};
            for (const key of Object.keys(row)) {
                converted[key] = row[key];
            }
            return converted;
        });
    }
    async executeQuery(query, params = []) {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const startTime = Date.now();
        try {
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
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
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
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
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
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
      FROM pg.public.customers c
      JOIN pg.public.transactions t ON c.customer_id = t.customer_id
      WHERE t.status = 'completed'
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_spent DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
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
      FROM pg.public.transactions t
      JOIN pg.public.merchants m ON t.merchant_id = m.merchant_id
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
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
      FROM pg.public.transactions
      GROUP BY status
      ORDER BY count DESC
    `;
        const startTime = Date.now();
        try {
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
                error: error.message,
            };
        }
    }
    async getSimple1M() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const query = `SELECT * FROM pg.public.transactions LIMIT 1000000`;
        const startTime = Date.now();
        try {
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
                error: error.message,
            };
        }
    }
    async getSimple5() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const query = `SELECT * FROM pg.public.transactions LIMIT 5`;
        const startTime = Date.now();
        try {
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
                error: error.message,
            };
        }
    }
    async getSimple100K() {
        if (!this.isAvailable) {
            return this.notAvailableResponse();
        }
        const query = `SELECT * FROM pg.public.transactions LIMIT 100000`;
        const startTime = Date.now();
        try {
            const result = await this.runQueryInDocker(query);
            const executionTimeMs = Date.now() - startTime;
            return {
                data: this.convertBigInts(result),
                executionTimeMs,
                rowCount: result.length,
                engine: 'duckdb-docker',
                query: query.trim(),
            };
        }
        catch (error) {
            return {
                data: [],
                executionTimeMs: Date.now() - startTime,
                rowCount: 0,
                engine: 'duckdb-docker',
                error: error.message,
            };
        }
    }
};
exports.DuckdbDockerEngine = DuckdbDockerEngine;
exports.DuckdbDockerEngine = DuckdbDockerEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DuckdbDockerEngine);
//# sourceMappingURL=duckdb-docker.engine.js.map