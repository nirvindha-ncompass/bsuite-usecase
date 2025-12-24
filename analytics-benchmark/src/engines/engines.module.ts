import { Module, Global } from '@nestjs/common';
import { EngineSelectorService } from './engine-selector.service';
import { PostgresqlEngine } from './postgresql.engine';
import { PostgresqlDockerEngine } from './postgresql-docker.engine';
import { ClickhouseEngine } from './clickhouse.engine';
import { ClickhouseLocalEngine } from './clickhouse-local.engine';
import { DuckdbEngine } from './duckdb.engine';
import { DuckdbDockerEngine } from './duckdb-docker.engine';

/**
 * Global module that registers and exports all analytics engine implementations.
 * Provides the `EngineSelectorService` to other modules.
 */
@Global()
@Module({
  providers: [
    EngineSelectorService,
    PostgresqlEngine,
    PostgresqlDockerEngine,
    ClickhouseEngine,
    ClickhouseLocalEngine,
    DuckdbEngine,
    DuckdbDockerEngine,
  ],
  exports: [
    EngineSelectorService,
    PostgresqlEngine,
    PostgresqlDockerEngine,
    ClickhouseEngine,
    ClickhouseLocalEngine,
    DuckdbEngine,
    DuckdbDockerEngine,
  ],
})
export class EnginesModule {}
