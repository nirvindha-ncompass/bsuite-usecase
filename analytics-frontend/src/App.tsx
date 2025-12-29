import { useState } from 'react';
import { analyticsApi, EngineType, AnalyticsResponse, BenchmarkResponse } from './api/analytics';

type QueryType = 'revenue-by-merchant' | 'daily-transactions' | 'customer-spending' | 'category-distribution' | 'status-summary' | 'simple-1m' | 'simple-5' | 'simple-100k';

interface QueryOption {
    id: QueryType;
    title: string;
    description: string;
    rowsAffected: string;
}

interface EngineOption {
    id: EngineType;
    label: string;
    shortLabel: string;
    type: 'local' | 'docker';
    color: string;
}

const QUERY_OPTIONS: QueryOption[] = [
    { id: 'revenue-by-merchant', title: 'Revenue by Merchant', description: 'Top merchants by total revenue', rowsAffected: '~100K' },
    { id: 'daily-transactions', title: 'Daily Transactions', description: 'Transaction volume by day', rowsAffected: '~365' },
    { id: 'customer-spending', title: 'Customer Spending', description: 'Top customers by spending', rowsAffected: '~1M' },
    { id: 'category-distribution', title: 'Category Distribution', description: 'Transactions by category', rowsAffected: '~10' },
    { id: 'status-summary', title: 'Status Summary', description: 'Transaction status breakdown', rowsAffected: '~5' },
    { id: 'simple-1m', title: 'Simple SELECT 1M', description: 'Simple SELECT query', rowsAffected: '1M' },
    { id: 'simple-5', title: 'Simple SELECT 5', description: 'Simple SELECT query', rowsAffected: '5' },
    { id: 'simple-100k', title: 'Simple SELECT 100K', description: 'Simple SELECT query', rowsAffected: '100K' },
];

const ENGINES: EngineOption[] = [
    { id: 'postgresql-docker', label: 'PostgreSQL Docker', shortLabel: 'PG Docker', type: 'docker', color: 'postgresql' },
    { id: 'clickhouse-docker', label: 'ClickHouse Docker', shortLabel: 'CH Docker', type: 'docker', color: 'clickhouse' },
    { id: 'duckdb-docker', label: 'DuckDB Docker', shortLabel: 'Duck Docker', type: 'docker', color: 'duckdb' },
];

/**
 * Main application component.
 * Orchestrates the analytics dashboard, including engine selection, query execution, and result visualization.
 */
function App() {
    const [selectedEngine, setSelectedEngine] = useState<EngineType>('postgresql-docker');
    const [selectedQuery, setSelectedQuery] = useState<QueryType>('status-summary');
    const [result, setResult] = useState<AnalyticsResponse | null>(null);
    const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [benchmarking, setBenchmarking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0, engine: '' });

    /**
     * Executes the selected query on the selected engine.
     */
    const executeQuery = async () => {
        setLoading(true);
        setError(null);
        setBenchmarkResult(null);
        setProgress({ current: 0, total: 1, engine: selectedEngine });

        try {
            let response: AnalyticsResponse;

            switch (selectedQuery) {
                case 'revenue-by-merchant':
                    response = await analyticsApi.getRevenueByMerchant(selectedEngine);
                    break;
                case 'daily-transactions':
                    response = await analyticsApi.getDailyTransactions(selectedEngine);
                    break;
                case 'customer-spending':
                    response = await analyticsApi.getCustomerSpending(selectedEngine);
                    break;
                case 'category-distribution':
                    response = await analyticsApi.getCategoryDistribution(selectedEngine);
                    break;
                case 'status-summary':
                    response = await analyticsApi.getStatusSummary(selectedEngine);
                    break;
                case 'simple-1m':
                    response = await analyticsApi.getSimple1M(selectedEngine);
                    break;
                case 'simple-5':
                    response = await analyticsApi.getSimple5(selectedEngine);
                    break;
                case 'simple-100k':
                    response = await analyticsApi.getSimple100K(selectedEngine);
                    break;
                default:
                    throw new Error('Unknown query type');
            }

            setProgress({ current: 1, total: 1, engine: selectedEngine });
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Runs the selected query across all available engines to benchmark performance.
     */
    const runBenchmark = async () => {
        setBenchmarking(true);
        setError(null);
        setResult(null);
        const totalRuns = ENGINES.length * 5; // 3 engines × 5 runs each
        setProgress({ current: 0, total: totalRuns, engine: '' });

        try {
            const results: any[] = [];
            let currentRun = 0;

            // Run each engine 5 times
            for (let i = 0; i < ENGINES.length; i++) {
                const engine = ENGINES[i];
                const runs: number[] = [];

                for (let runNum = 1; runNum <= 5; runNum++) {
                    setProgress({
                        current: currentRun,
                        total: totalRuns,
                        engine: `${engine.label} (Run ${runNum}/5)`
                    });

                    try {
                        let response: AnalyticsResponse;
                        switch (selectedQuery) {
                            case 'revenue-by-merchant':
                                response = await analyticsApi.getRevenueByMerchant(engine.id);
                                break;
                            case 'daily-transactions':
                                response = await analyticsApi.getDailyTransactions(engine.id);
                                break;
                            case 'customer-spending':
                                response = await analyticsApi.getCustomerSpending(engine.id);
                                break;
                            case 'category-distribution':
                                response = await analyticsApi.getCategoryDistribution(engine.id);
                                break;
                            case 'status-summary':
                                response = await analyticsApi.getStatusSummary(engine.id);
                                break;
                            case 'simple-1m':
                                response = await analyticsApi.getSimple1M(engine.id);
                                break;
                            case 'simple-5':
                                response = await analyticsApi.getSimple5(engine.id);
                                break;
                            case 'simple-100k':
                                response = await analyticsApi.getSimple100K(engine.id);
                                break;
                            default:
                                response = await analyticsApi.getStatusSummary(engine.id);
                                break;
                        }

                        if (!response.error && response.executionTimeMs) {
                            runs.push(response.executionTimeMs);
                        }
                    } catch (err) {
                        console.error(`Run ${runNum} failed for ${engine.label}:`, err);
                    }

                    currentRun++;
                }

                // Calculate average
                const average = runs.length > 0
                    ? runs.reduce((sum, time) => sum + time, 0) / runs.length
                    : null;

                results.push({
                    engine: engine.id,
                    runs: runs,
                    average: average,
                    success: runs.length > 0,
                    error: runs.length === 0 ? 'All runs failed' : null,
                });
            }

            setProgress({ current: totalRuns, total: totalRuns, engine: 'Complete' });

            // Find fastest average
            const successfulResults = results.filter(r => r.success && r.average);
            successfulResults.sort((a, b) => a.average - b.average);

            setBenchmarkResult({
                queryType: selectedQuery,
                timestamp: new Date().toISOString(),
                results,
                fastest: successfulResults.length > 0 ? successfulResults[0].engine : null,
                comparison: generateComparison(results),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Benchmark failed');
        } finally {
            setBenchmarking(false);
        }
    };

    /**
     * Exports benchmark results to CSV format
     */
    const exportBenchmarkToCSV = () => {
        if (!benchmarkResult) return;

        const queryName = QUERY_OPTIONS.find(q => q.id === benchmarkResult.queryType)?.title || benchmarkResult.queryType;
        const rows = benchmarkResult.results.map(result => {
            const engineLabel = getEngineLabel(result.engine);
            const runs = result.runs || [];
            const run1 = runs[0] || '';
            const run2 = runs[1] || '';
            const run3 = runs[2] || '';
            const run4 = runs[3] || '';
            const run5 = runs[4] || '';
            const average = result.average ? result.average.toFixed(2) : '';

            return `${queryName},${engineLabel},${run1},${run2},${run3},${run4},${run5},${average}`;
        });

        const csvContent = [
            'Query Type,Engine,Run 1 (ms),Run 2 (ms),Run 3 (ms),Run 4 (ms),Run 5 (ms),Average (ms)',
            ...rows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

        link.setAttribute('href', url);
        link.setAttribute('download', `benchmark_${benchmarkResult.queryType}_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * Generates a text summary comparing benchmark results.
     */
    const generateComparison = (results: any[]): string => {
        const successful = results.filter(r => r.success && r.average);
        if (successful.length === 0) return 'No successful executions';

        const fastest = Math.min(...successful.map(r => r.average));
        const fastestEngine = successful.find(r => r.average === fastest);

        return `Fastest Average: ${getEngineLabel(fastestEngine?.engine)} at ${fastest.toFixed(2)}ms`;
    };

    const getEngineLabel = (engineId: string | undefined): string => {
        if (!engineId) return 'Unknown';
        const engine = ENGINES.find(e => e.id === engineId);
        return engine ? engine.label : engineId;
    };

    const getEngineShortLabel = (engineId: string): string => {
        const engine = ENGINES.find(e => e.id === engineId);
        return engine ? engine.shortLabel : engineId;
    };

    const formatNumber = (num: number | string | null | undefined): string => {
        if (num === null || num === undefined) return 'N/A';
        const n = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(n)) return String(num);
        return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    const formatCurrency = (num: number | string | null | undefined): string => {
        if (num === null || num === undefined) return 'N/A';
        const n = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(n)) return String(num);
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const renderDataTable = (data: any[]) => {
        if (!data || data.length === 0) {
            return <div className="empty-state">No data to display</div>;
        }

        const columns = Object.keys(data[0]);

        return (
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col}>{col.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, 50).map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td key={col}>
                                        {typeof row[col] === 'number' || (typeof row[col] === 'string' && !isNaN(parseFloat(row[col])))
                                            ? col.includes('amount') || col.includes('revenue') || col.includes('spent')
                                                ? formatCurrency(row[col])
                                                : formatNumber(row[col])
                                            : row[col] instanceof Date
                                                ? row[col].toLocaleDateString()
                                                : String(row[col] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">Analytics Engine Benchmark</h1>
                <p className="app-subtitle">Compare PostgreSQL, ClickHouse & DuckDB Performance</p>
            </header>

            <div className="main-grid">
                <div className="controls-panel">
                    {/* Engine Selector */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Select Engine</h2>
                        </div>

                        <div className="engine-group">
                            <span className="engine-group-label">🐳 Docker</span>
                            <div className="engine-selector">
                                {ENGINES.map((engine) => (
                                    <button
                                        key={engine.id}
                                        className={`engine-button ${selectedEngine === engine.id ? `active ${engine.color}` : ''}`}
                                        onClick={() => setSelectedEngine(engine.id)}
                                        title={engine.label}
                                    >
                                        <span className="engine-indicator" />
                                        {engine.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Query Selector */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Select Query</h2>
                        </div>
                        <div className="query-grid">
                            {QUERY_OPTIONS.map((query) => (
                                <button
                                    key={query.id}
                                    className={`query-button ${selectedQuery === query.id ? 'active' : ''}`}
                                    onClick={() => setSelectedQuery(query.id)}
                                >
                                    <span className="query-button-title">
                                        {query.title}
                                        <span className="rows-badge">{query.rowsAffected}</span>
                                    </span>
                                    <span className="query-button-desc">{query.description}</span>
                                </button>
                            ))}
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={executeQuery}
                                disabled={loading || benchmarking}
                            >
                                {loading ? 'Executing...' : '▶ Execute Query'}
                            </button>
                            <button
                                className="btn btn-benchmark"
                                onClick={runBenchmark}
                                disabled={loading || benchmarking}
                            >
                                {benchmarking ? 'Running...' : '🏁 Benchmark All 3'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="results-panel">
                    {error && (
                        <div className="card">
                            <div className="error-message">{error}</div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {(loading || benchmarking) && (
                        <div className="card progress-card">
                            <div className="progress-header">
                                <span className="progress-title">
                                    {benchmarking ? `Testing: ${progress.engine}` : `Querying: ${getEngineLabel(selectedEngine)}`}
                                </span>
                                <span className="progress-text">
                                    {benchmarking ? `${progress.current} / ${progress.total} engines` : 'Processing...'}
                                </span>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${loading ? 100 : progressPercentage}%` }}
                                />
                            </div>
                            <div className="progress-details">
                                <span className="spinner-small" />
                                <span>{benchmarking ? 'Running benchmark across all engines...' : 'Executing query...'}</span>
                            </div>
                        </div>
                    )}

                    {/* Benchmark Results */}
                    {benchmarkResult && !benchmarking && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">🏆 Benchmark Results</h2>
                                <button
                                    className="btn btn-primary"
                                    onClick={exportBenchmarkToCSV}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    📥 Export to CSV
                                </button>
                            </div>
                            <div className="benchmark-grid">
                                {benchmarkResult.results.map((res: any) => {
                                    const isFastest = res.success && res.engine === benchmarkResult.fastest;
                                    return (
                                        <div
                                            key={res.engine}
                                            className={`benchmark-card ${isFastest ? 'fastest' : ''} ${!res.success ? 'error' : ''}`}
                                        >
                                            {isFastest && <div className="fastest-badge">🏆 FASTEST</div>}
                                            <div className="benchmark-engine-name">
                                                {getEngineShortLabel(res.engine)}
                                            </div>
                                            <div className="benchmark-engine-type">
                                                {res.engine.includes('docker') ? 'Docker' : 'Local'}
                                            </div>
                                            {res.success ? (
                                                <>
                                                    <div className="benchmark-time">
                                                        {res.average ? formatNumber(res.average) : 'N/A'}
                                                        <span className="benchmark-time-unit">ms avg</span>
                                                    </div>
                                                    <div className="benchmark-rows">
                                                        {res.runs?.length || 0} runs
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="benchmark-error-text">
                                                    {res.error?.substring(0, 50) || 'Failed'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="benchmark-summary">
                                {benchmarkResult.comparison}
                            </div>
                        </div>
                    )}

                    {/* Single Query Results */}
                    {result && !loading && !benchmarkResult && (
                        <div className="card results-section">
                            <div className="results-header">
                                <h2 className="card-title">Query Results</h2>
                                <div className="results-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Engine</span>
                                        <span className="meta-value engine">{getEngineLabel(result.engine)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Time</span>
                                        <span className="meta-value time">{result.executionTimeMs}ms</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Rows</span>
                                        <span className="meta-value">{formatNumber(result.rowCount)}</span>
                                    </div>
                                </div>
                            </div>
                            {result.error ? (
                                <div className="error-message">{result.error}</div>
                            ) : (
                                renderDataTable(result.data)
                            )}
                        </div>
                    )}

                    {!result && !benchmarkResult && !loading && !benchmarking && !error && (
                        <div className="card empty-card">
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <h3>Ready to Benchmark</h3>
                                <p>Select an engine and query, then click Execute or Benchmark</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
