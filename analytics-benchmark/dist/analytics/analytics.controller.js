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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const dto_1 = require("./dto");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getEngines() {
        return this.analyticsService.getAvailableEngines();
    }
    async getRevenueByMerchant(engine, limit = 100) {
        return this.analyticsService.getRevenueByMerchant(engine, limit);
    }
    async getDailyTransactions(engine, days = 30) {
        return this.analyticsService.getDailyTransactions(engine, days);
    }
    async getCustomerSpending(engine, limit = 100) {
        return this.analyticsService.getCustomerSpending(engine, limit);
    }
    async getCategoryDistribution(engine) {
        return this.analyticsService.getCategoryDistribution(engine);
    }
    async getStatusSummary(engine) {
        return this.analyticsService.getStatusSummary(engine);
    }
    async getSimple1M(engine) {
        return this.analyticsService.getSimple1M(engine);
    }
    async getSimple5(engine) {
        return this.analyticsService.getSimple5(engine);
    }
    async getSimple100K(engine) {
        return this.analyticsService.getSimple100K(engine);
    }
    async runBenchmark(queryType) {
        return this.analyticsService.runBenchmark(queryType);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('engines'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available analytics engines' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of available engines' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getEngines", null);
__decorate([
    (0, common_1.Get)('revenue-by-merchant'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue aggregated by merchant' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns merchant revenue data', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRevenueByMerchant", null);
__decorate([
    (0, common_1.Get)('daily-transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily transaction volumes' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns daily transaction data', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDailyTransactions", null);
__decorate([
    (0, common_1.Get)('customer-spending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top customers by spending' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns customer spending data', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCustomerSpending", null);
__decorate([
    (0, common_1.Get)('category-distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction distribution by category' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns category distribution data', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCategoryDistribution", null);
__decorate([
    (0, common_1.Get)('status-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction status summary' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns status summary data', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStatusSummary", null);
__decorate([
    (0, common_1.Get)('simple-1m'),
    (0, swagger_1.ApiOperation)({ summary: 'Simple SELECT query - 1 million rows' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns 1M rows from transactions', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSimple1M", null);
__decorate([
    (0, common_1.Get)('simple-5'),
    (0, swagger_1.ApiOperation)({ summary: 'Simple SELECT query - 5 rows' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns 5 rows from transactions', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSimple5", null);
__decorate([
    (0, common_1.Get)('simple-100k'),
    (0, swagger_1.ApiOperation)({ summary: 'Simple SELECT query - 100K rows' }),
    (0, swagger_1.ApiQuery)({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns 100K rows from transactions', type: dto_1.AnalyticsResponseDto }),
    __param(0, (0, common_1.Query)('engine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSimple100K", null);
__decorate([
    (0, common_1.Get)('benchmark'),
    (0, swagger_1.ApiOperation)({ summary: 'Run a query across all engines and compare performance' }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: true, enum: ['revenue-by-merchant', 'daily-transactions', 'customer-spending', 'category-distribution', 'status-summary', 'simple-1m', 'simple-5', 'simple-100k'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns performance comparison across engines' }),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "runBenchmark", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map