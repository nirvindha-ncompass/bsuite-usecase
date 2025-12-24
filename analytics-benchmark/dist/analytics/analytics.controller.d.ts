import { AnalyticsService } from './analytics.service';
import { EngineType } from '../engines/engine-selector.service';
import { AnalyticsResponseDto } from './dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getEngines(): {
        availableEngines: EngineType[];
        defaultEngine: EngineType;
    };
    getRevenueByMerchant(engine?: EngineType, limit?: number): Promise<AnalyticsResponseDto>;
    getDailyTransactions(engine?: EngineType, days?: number): Promise<AnalyticsResponseDto>;
    getCustomerSpending(engine?: EngineType, limit?: number): Promise<AnalyticsResponseDto>;
    getCategoryDistribution(engine?: EngineType): Promise<AnalyticsResponseDto>;
    getStatusSummary(engine?: EngineType): Promise<AnalyticsResponseDto>;
    runBenchmark(queryType: string): Promise<import("./dto").BenchmarkResponseDto>;
}
