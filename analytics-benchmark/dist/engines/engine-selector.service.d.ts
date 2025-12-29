import { ConfigService } from '@nestjs/config';
import { PostgresqlDockerEngine } from './postgresql-docker.engine';
import { ClickhouseEngine } from './clickhouse.engine';
import { DuckdbDockerEngine } from './duckdb-docker.engine';
export type EngineType = 'postgresql-docker' | 'clickhouse-docker' | 'duckdb-docker';
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
    getSimple1M(): Promise<any>;
    getSimple5(): Promise<any>;
    getSimple100K(): Promise<any>;
}
export declare class EngineSelectorService {
    private readonly configService;
    private readonly postgresqlDockerEngine;
    private readonly clickhouseEngine;
    private readonly duckdbDockerEngine;
    private readonly defaultEngine;
    constructor(configService: ConfigService, postgresqlDockerEngine: PostgresqlDockerEngine, clickhouseEngine: ClickhouseEngine, duckdbDockerEngine: DuckdbDockerEngine);
    getEngine(engineType?: EngineType): AnalyticsEngine;
    getAvailableEngines(): EngineType[];
    getDefaultEngine(): EngineType;
}
