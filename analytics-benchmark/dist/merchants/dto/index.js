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
exports.PaginatedMerchantsDto = exports.PaginationMeta = exports.MerchantResponseDto = exports.UpdateMerchantDto = exports.CreateMerchantDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMerchantDto {
}
exports.CreateMerchantDto = CreateMerchantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Super Mart ABC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMerchantDto.prototype, "merchant_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Grocery' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMerchantDto.prototype, "category", void 0);
class UpdateMerchantDto {
}
exports.UpdateMerchantDto = UpdateMerchantDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Super Mart ABC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMerchantDto.prototype, "merchant_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Grocery' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMerchantDto.prototype, "category", void 0);
class MerchantResponseDto {
}
exports.MerchantResponseDto = MerchantResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MerchantResponseDto.prototype, "merchant_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantResponseDto.prototype, "merchant_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MerchantResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], MerchantResponseDto.prototype, "created_at", void 0);
class PaginationMeta {
}
exports.PaginationMeta = PaginationMeta;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMeta.prototype, "totalPages", void 0);
class PaginatedMerchantsDto {
}
exports.PaginatedMerchantsDto = PaginatedMerchantsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MerchantResponseDto] }),
    __metadata("design:type", Array)
], PaginatedMerchantsDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaginationMeta }),
    __metadata("design:type", PaginationMeta)
], PaginatedMerchantsDto.prototype, "meta", void 0);
//# sourceMappingURL=index.js.map