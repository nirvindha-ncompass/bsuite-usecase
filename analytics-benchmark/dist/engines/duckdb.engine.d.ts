import { ConfigService } from '@nestjs/config';
import { AnalyticsEngine } from './engine-selector.service';
export declare class DuckdbEngine implements AnalyticsEngine {
    private readonly configService;
    private db;
    private connection;
    private connectionString;
    private isAvailable;
    private initPromise;
    constructor(configService: ConfigService);
    private initializeDatabase;
    private runQuery;
    private convertBigInts;
    private ensureInitialized;
    private notAvailableResponse;
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
