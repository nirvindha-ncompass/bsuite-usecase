import { EngineSelectorService, EngineType } from '../engines/engine-selector.service';
import { AnalyticsResponseDto, BenchmarkResponseDto } from './dto';
export declare class AnalyticsService {
    private readonly engineSelector;
    private readonly logger;
    constructor(engineSelector: EngineSelectorService);
    getAvailableEngines(): {
        availableEngines: EngineType[];
        defaultEngine: EngineType;
    };
    getRevenueByMerchant(engineType?: EngineType, limit?: number): Promise<AnalyticsResponseDto>;
    getDailyTransactions(engineType?: EngineType, days?: number): Promise<AnalyticsResponseDto>;
    getCustomerSpending(engineType?: EngineType, limit?: number): Promise<AnalyticsResponseDto>;
    getCategoryDistribution(engineType?: EngineType): Promise<AnalyticsResponseDto>;
    getStatusSummary(engineType?: EngineType): Promise<AnalyticsResponseDto>;
    getSimple1M(engineType?: EngineType): Promise<AnalyticsResponseDto>;
    getSimple5(engineType?: EngineType): Promise<AnalyticsResponseDto>;
    getSimple100K(engineType?: EngineType): Promise<AnalyticsResponseDto>;
    runBenchmark(queryType: string): Promise<BenchmarkResponseDto>;
    private generateComparison;
}
