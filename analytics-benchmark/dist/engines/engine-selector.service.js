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
const postgresql_engine_1 = require("./postgresql.engine");
const postgresql_docker_engine_1 = require("./postgresql-docker.engine");
const clickhouse_engine_1 = require("./clickhouse.engine");
const clickhouse_local_engine_1 = require("./clickhouse-local.engine");
const duckdb_engine_1 = require("./duckdb.engine");
const duckdb_docker_engine_1 = require("./duckdb-docker.engine");
let EngineSelectorService = class EngineSelectorService {
    constructor(configService, postgresqlEngine, postgresqlDockerEngine, clickhouseLocalEngine, clickhouseEngine, duckdbEngine, duckdbDockerEngine) {
        this.configService = configService;
        this.postgresqlEngine = postgresqlEngine;
        this.postgresqlDockerEngine = postgresqlDockerEngine;
        this.clickhouseLocalEngine = clickhouseLocalEngine;
        this.clickhouseEngine = clickhouseEngine;
        this.duckdbEngine = duckdbEngine;
        this.duckdbDockerEngine = duckdbDockerEngine;
        this.defaultEngine = (this.configService.get('defaultEngine') || 'postgresql-local');
    }
    getEngine(engineType) {
        const engine = engineType || this.defaultEngine;
        switch (engine) {
            case 'postgresql-local':
                return this.postgresqlEngine;
            case 'postgresql-docker':
                return this.postgresqlDockerEngine;
            case 'clickhouse-local':
                return this.clickhouseLocalEngine;
            case 'clickhouse-docker':
                return this.clickhouseEngine;
            case 'duckdb-local':
                return this.duckdbEngine;
            case 'duckdb-docker':
                return this.duckdbDockerEngine;
            default:
                return this.postgresqlEngine;
        }
    }
    getAvailableEngines() {
        return [
            'postgresql-local',
            'postgresql-docker',
            'clickhouse-local',
            'clickhouse-docker',
            'duckdb-local',
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
        postgresql_engine_1.PostgresqlEngine,
        postgresql_docker_engine_1.PostgresqlDockerEngine,
        clickhouse_local_engine_1.ClickhouseLocalEngine,
        clickhouse_engine_1.ClickhouseEngine,
        duckdb_engine_1.DuckdbEngine,
        duckdb_docker_engine_1.DuckdbDockerEngine])
], EngineSelectorService);
//# sourceMappingURL=engine-selector.service.js.map