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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const engine_selector_service_1 = require("../engines/engine-selector.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(engineSelector) {
        this.engineSelector = engineSelector;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    getAvailableEngines() {
        return {
            availableEngines: this.engineSelector.getAvailableEngines(),
            defaultEngine: this.engineSelector.getDefaultEngine(),
        };
    }
    async getRevenueByMerchant(engineType, limit = 100) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getRevenueByMerchant on ${engineName} engine`);
        try {
            const result = await engine.getRevenueByMerchant(limit);
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async getDailyTransactions(engineType, days = 30) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getDailyTransactions on ${engineName} engine`);
        try {
            const result = await engine.getDailyTransactions(days);
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async getCustomerSpending(engineType, limit = 100) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getCustomerSpending on ${engineName} engine`);
        try {
            const result = await engine.getCustomerSpending(limit);
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async getCategoryDistribution(engineType) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getCategoryDistribution on ${engineName} engine`);
        try {
            const result = await engine.getCategoryDistribution();
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async getStatusSummary(engineType) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getStatusSummary on ${engineName} engine`);
        try {
            const result = await engine.getStatusSummary();
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async getSimple1M(engineType) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getSimple1M on ${engineName} engine`);
        try {
            const result = await engine.getSimple1M();
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async getSimple5(engineType) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getSimple5 on ${engineName} engine`);
        try {
            const result = await engine.getSimple5();
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async getSimple100K(engineType) {
        const engine = this.engineSelector.getEngine(engineType);
        const engineName = engineType || this.engineSelector.getDefaultEngine();
        this.logger.log(`Executing getSimple100K on ${engineName} engine`);
        try {
            const result = await engine.getSimple100K();
            return {
                ...result,
                engine: engineName,
            };
        }
        catch (error) {
            this.logger.error(`Error executing query on ${engineName}: ${error.message}`);
            throw error;
        }
    }
    async runBenchmark(queryType) {
        const engines = [
            'postgresql-docker',
            'clickhouse-docker',
            'duckdb-docker',
        ];
        const results = [];
        for (const engine of engines) {
            try {
                let result;
                const startTime = Date.now();
                switch (queryType) {
                    case 'revenue-by-merchant':
                        result = await this.getRevenueByMerchant(engine, 100);
                        break;
                    case 'daily-transactions':
                        result = await this.getDailyTransactions(engine, 30);
                        break;
                    case 'customer-spending':
                        result = await this.getCustomerSpending(engine, 100);
                        break;
                    case 'category-distribution':
                        result = await this.getCategoryDistribution(engine);
                        break;
                    case 'status-summary':
                        result = await this.getStatusSummary(engine);
                        break;
                    default:
                        throw new Error(`Unknown query type: ${queryType}`);
                }
                results.push({
                    engine,
                    executionTimeMs: result.executionTimeMs,
                    rowCount: result.rowCount,
                    success: true,
                    error: null,
                });
            }
            catch (error) {
                results.push({
                    engine,
                    executionTimeMs: null,
                    rowCount: null,
                    success: false,
                    error: error.message,
                });
            }
        }
        const successfulResults = results.filter(r => r.success);
        successfulResults.sort((a, b) => a.executionTimeMs - b.executionTimeMs);
        return {
            queryType,
            timestamp: new Date().toISOString(),
            results,
            fastest: successfulResults.length > 0 ? successfulResults[0].engine : null,
            comparison: this.generateComparison(results),
        };
    }
    generateComparison(results) {
        const successful = results.filter(r => r.success);
        if (successful.length === 0)
            return 'No successful executions';
        const fastest = Math.min(...successful.map(r => r.executionTimeMs));
        return successful.map(r => {
            const diff = r.executionTimeMs - fastest;
            const percentage = fastest > 0 ? ((diff / fastest) * 100).toFixed(1) : '0';
            return `${r.engine}: ${r.executionTimeMs}ms ${diff > 0 ? `(+${diff}ms, +${percentage}%)` : '(fastest)'}`;
        }).join(' | ');
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [engine_selector_service_1.EngineSelectorService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map