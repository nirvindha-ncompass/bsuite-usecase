export declare class AnalyticsResponseDto {
    data: any[];
    executionTimeMs: number;
    rowCount: number;
    engine: string;
    query?: string;
}
export declare class BenchmarkResultDto {
    engine: string;
    executionTimeMs: number | null;
    rowCount: number | null;
    success: boolean;
    error: string | null;
}
export declare class BenchmarkResponseDto {
    queryType: string;
    timestamp: string;
    results: BenchmarkResultDto[];
    fastest: string | null;
    comparison: string;
}
