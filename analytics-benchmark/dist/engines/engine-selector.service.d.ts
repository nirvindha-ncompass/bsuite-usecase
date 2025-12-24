import { ConfigService } from '@nestjs/config';
import { PostgresqlEngine } from './postgresql.engine';
import { PostgresqlDockerEngine } from './postgresql-docker.engine';
import { ClickhouseEngine } from './clickhouse.engine';
import { ClickhouseLocalEngine } from './clickhouse-local.engine';
import { DuckdbEngine } from './duckdb.engine';
import { DuckdbDockerEngine } from './duckdb-docker.engine';
export type EngineType = 'postgresql-local' | 'postgresql-docker' | 'clickhouse-local' | 'clickhouse-docker' | 'duckdb-local' | 'duckdb-docker';
export interface AnalyticsEngine {
    executeQuery(query: string, params?: any[]): Promise<{
        data: any[];
        executionTimeMs: number;
        rowCount: number;
    }>;
    getRevenueByMerchant(limit?: number): Promise<any>;
    getDailyTransactions(days?: number): Promise<any>;
    getCustomerSpending(limit?: number): Promise<any>;
    getCategoryDistribution(): Promise<any>;
    getStatusSummary(): Promise<any>;
}
export declare class EngineSelectorService {
    private readonly configService;
    private readonly postgresqlEngine;
    private readonly postgresqlDockerEngine;
    private readonly clickhouseLocalEngine;
    private readonly clickhouseEngine;
    private readonly duckdbEngine;
    private readonly duckdbDockerEngine;
    private readonly defaultEngine;
    constructor(configService: ConfigService, postgresqlEngine: PostgresqlEngine, postgresqlDockerEngine: PostgresqlDockerEngine, clickhouseLocalEngine: ClickhouseLocalEngine, clickhouseEngine: ClickhouseEngine, duckdbEngine: DuckdbEngine, duckdbDockerEngine: DuckdbDockerEngine);
    getEngine(engineType?: EngineType): AnalyticsEngine;
    getAvailableEngines(): EngineType[];
    getDefaultEngine(): EngineType;
}
