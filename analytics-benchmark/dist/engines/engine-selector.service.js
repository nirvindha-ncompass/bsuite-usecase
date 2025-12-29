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
exports.EngineSelectorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const postgresql_docker_engine_1 = require("./postgresql-docker.engine");
const clickhouse_engine_1 = require("./clickhouse.engine");
const duckdb_docker_engine_1 = require("./duckdb-docker.engine");
let EngineSelectorService = class EngineSelectorService {
    constructor(configService, postgresqlDockerEngine, clickhouseEngine, duckdbDockerEngine) {
        this.configService = configService;
        this.postgresqlDockerEngine = postgresqlDockerEngine;
        this.clickhouseEngine = clickhouseEngine;
        this.duckdbDockerEngine = duckdbDockerEngine;
        this.defaultEngine = (this.configService.get('defaultEngine') || 'postgresql-docker');
    }
    getEngine(engineType) {
        const engine = engineType || this.defaultEngine;
        switch (engine) {
            case 'postgresql-docker':
                return this.postgresqlDockerEngine;
            case 'clickhouse-docker':
                return this.clickhouseEngine;
            case 'duckdb-docker':
                return this.duckdbDockerEngine;
            default:
                return this.postgresqlDockerEngine;
        }
    }
    getAvailableEngines() {
        return [
            'postgresql-docker',
            'clickhouse-docker',
            'duckdb-docker',
        ];
    }
    getDefaultEngine() {
        return this.defaultEngine;
    }
};
exports.EngineSelectorService = EngineSelectorService;
exports.EngineSelectorService = EngineSelectorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        postgresql_docker_engine_1.PostgresqlDockerEngine,
        clickhouse_engine_1.ClickhouseEngine,
        duckdb_docker_engine_1.DuckdbDockerEngine])
], EngineSelectorService);
//# sourceMappingURL=engine-selector.service.js.map