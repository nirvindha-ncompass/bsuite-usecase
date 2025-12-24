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
exports.BenchmarkResponseDto = exports.BenchmarkResultDto = exports.AnalyticsResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AnalyticsResponseDto {
}
exports.AnalyticsResponseDto = AnalyticsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Query result data' }),
    __metadata("design:type", Array)
], AnalyticsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Query execution time in milliseconds' }),
    __metadata("design:type", Number)
], AnalyticsResponseDto.prototype, "executionTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of rows returned' }),
    __metadata("design:type", Number)
], AnalyticsResponseDto.prototype, "rowCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Engine used for the query', enum: ['postgresql', 'clickhouse', 'duckdb'] }),
    __metadata("design:type", String)
], AnalyticsResponseDto.prototype, "engine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'The SQL query executed' }),
    __metadata("design:type", String)
], AnalyticsResponseDto.prototype, "query", void 0);
class BenchmarkResultDto {
}
exports.BenchmarkResultDto = BenchmarkResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Engine name' }),
    __metadata("design:type", String)
], BenchmarkResultDto.prototype, "engine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Execution time in milliseconds' }),
    __metadata("design:type", Number)
], BenchmarkResultDto.prototype, "executionTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of rows returned' }),
    __metadata("design:type", Number)
], BenchmarkResultDto.prototype, "rowCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the query was successful' }),
    __metadata("design:type", Boolean)
], BenchmarkResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Error message if failed' }),
    __metadata("design:type", String)
], BenchmarkResultDto.prototype, "error", void 0);
class BenchmarkResponseDto {
}
exports.BenchmarkResponseDto = BenchmarkResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of query benchmarked' }),
    __metadata("design:type", String)
], BenchmarkResponseDto.prototype, "queryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the benchmark' }),
    __metadata("design:type", String)
], BenchmarkResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BenchmarkResultDto], description: 'Results from each engine' }),
    __metadata("design:type", Array)
], BenchmarkResponseDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'The fastest engine' }),
    __metadata("design:type", String)
], BenchmarkResponseDto.prototype, "fastest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human-readable comparison' }),
    __metadata("design:type", String)
], BenchmarkResponseDto.prototype, "comparison", void 0);
//# sourceMappingURL=index.js.map