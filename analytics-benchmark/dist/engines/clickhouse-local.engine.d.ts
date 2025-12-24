import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyticsEngine } from './engine-selector.service';
export declare class ClickhouseLocalEngine implements AnalyticsEngine, OnModuleInit {
    private readonly configService;
    private client;
    private pgConnectionString;
    private isAvailable;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeClient;
    private getPgTable;
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
