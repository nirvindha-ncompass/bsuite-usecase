import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresqlEngine } from './postgresql.engine';
import { PostgresqlDockerEngine } from './postgresql-docker.engine';
import { ClickhouseEngine } from './clickhouse.engine';
import { ClickhouseLocalEngine } from './clickhouse-local.engine';
import { DuckdbEngine } from './duckdb.engine';
import { DuckdbDockerEngine } from './duckdb-docker.engine';

export type EngineType = 
  | 'postgresql-local' 
  | 'postgresql-docker' 
  | 'clickhouse-local'
  | 'clickhouse-docker' 
  | 'duckdb-local' 
  | 'duckdb-docker';

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

/**
 * Service responsible for selecting and providing the appropriate analytics engine.
 * Acts as a factory/strategy pattern implementation.
 */
@Injectable()
export class EngineSelectorService {
  private readonly defaultEngine: EngineType;

  constructor(
    private readonly configService: ConfigService,
    private readonly postgresqlEngine: PostgresqlEngine,
    private readonly postgresqlDockerEngine: PostgresqlDockerEngine,
    private readonly clickhouseLocalEngine: ClickhouseLocalEngine,
    private readonly clickhouseEngine: ClickhouseEngine,
    private readonly duckdbEngine: DuckdbEngine,
    private readonly duckdbDockerEngine: DuckdbDockerEngine,
  ) {
    this.defaultEngine = (this.configService.get('defaultEngine') || 'postgresql-local') as EngineType;
  }

  /**
   * Retrieves an analytics engine instance based on the provided type.
   * @param engineType - The type of engine to retrieve (optional, defaults to configured default).
   * @returns The requested AnalyticsEngine instance.
   */
  getEngine(engineType?: EngineType): AnalyticsEngine {
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

  /**
   * Returns a list of all available engine types.
   * @returns Array of EngineType strings.
   */
  getAvailableEngines(): EngineType[] {
    return [
      'postgresql-local',
      'postgresql-docker',
      'clickhouse-local',
      'clickhouse-docker',
      'duckdb-local',
      'duckdb-docker',
    ];
  }

  /**
   * Returns the default engine type configured for the application.
   * @returns The default EngineType.
   */
  getDefaultEngine(): EngineType {
    return this.defaultEngine;
  }
}
