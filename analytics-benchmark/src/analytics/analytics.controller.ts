import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { EngineType } from '../engines/engine-selector.service';
import { AnalyticsResponseDto } from './dto';

/**
 * Controller for analytics endpoints.
 * Exposes APIs to query data using different engines and run benchmarks.
 */
@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Returns a list of available analytics engines.
   */
  @Get('engines')
  @ApiOperation({ summary: 'Get available analytics engines' })
  @ApiResponse({ status: 200, description: 'Returns list of available engines' })
  getEngines() {
    return this.analyticsService.getAvailableEngines();
  }

  /**
   * Get revenue aggregated by merchant.
   * @param engine - The analytics engine to use.
   * @param limit - Max number of results.
   */
  @Get('revenue-by-merchant')
  @ApiOperation({ summary: 'Get revenue aggregated by merchant' })
  @ApiQuery({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns merchant revenue data', type: AnalyticsResponseDto })
  async getRevenueByMerchant(
    @Query('engine') engine?: EngineType,
    @Query('limit') limit: number = 100,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getRevenueByMerchant(engine, limit);
  }

  /**
   * Get daily transaction volumes.
   * @param engine - The analytics engine to use.
   * @param days - Number of days to look back.
   */
  @Get('daily-transactions')
  @ApiOperation({ summary: 'Get daily transaction volumes' })
  @ApiQuery({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns daily transaction data', type: AnalyticsResponseDto })
  async getDailyTransactions(
    @Query('engine') engine?: EngineType,
    @Query('days') days: number = 30,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getDailyTransactions(engine, days);
  }

  /**
   * Get top customers by spending.
   * @param engine - The analytics engine to use.
   * @param limit - Max number of results.
   */
  @Get('customer-spending')
  @ApiOperation({ summary: 'Get top customers by spending' })
  @ApiQuery({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns customer spending data', type: AnalyticsResponseDto })
  async getCustomerSpending(
    @Query('engine') engine?: EngineType,
    @Query('limit') limit: number = 100,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getCustomerSpending(engine, limit);
  }

  /**
   * Get transaction distribution by category.
   * @param engine - The analytics engine to use.
   */
  @Get('category-distribution')
  @ApiOperation({ summary: 'Get transaction distribution by category' })
  @ApiQuery({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] })
  @ApiResponse({ status: 200, description: 'Returns category distribution data', type: AnalyticsResponseDto })
  async getCategoryDistribution(
    @Query('engine') engine?: EngineType,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getCategoryDistribution(engine);
  }

  /**
   * Get transaction status summary.
   * @param engine - The analytics engine to use.
   */
  @Get('status-summary')
  @ApiOperation({ summary: 'Get transaction status summary' })
  @ApiQuery({ name: 'engine', required: false, enum: ['postgresql-docker', 'clickhouse-docker', 'duckdb-docker'] })
  @ApiResponse({ status: 200, description: 'Returns status summary data', type: AnalyticsResponseDto })
  async getStatusSummary(
    @Query('engine') engine?: EngineType,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getStatusSummary(engine);
  }

  /**
   * Run a query across all engines and compare performance.
   * @param queryType - The type of query to benchmark.
   */
  @Get('benchmark')
  @ApiOperation({ summary: 'Run a query across all engines and compare performance' })
  @ApiQuery({ name: 'query', required: true, enum: ['revenue-by-merchant', 'daily-transactions', 'customer-spending', 'category-distribution', 'status-summary'] })
  @ApiResponse({ status: 200, description: 'Returns performance comparison across engines' })
  async runBenchmark(
    @Query('query') queryType: string,
  ) {
    return this.analyticsService.runBenchmark(queryType);
  }
}
