import { Pool } from 'pg';
import { AnalyticsEngine } from './engine-selector.service';
export declare class PostgresqlEngine implements AnalyticsEngine {
    private readonly pool;
    constructor(pool: Pool);
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
