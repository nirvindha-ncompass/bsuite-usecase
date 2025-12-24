import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyticsEngine } from './engine-selector.service';

/**
 * DuckDB Engine (Local)
 * Uses the `postgres_scanner` extension to query a local PostgreSQL instance.
 * DuckDB runs in-process and attaches to Postgres via the `ATTACH` command.
 */
@Injectable()
export class DuckdbEngine implements AnalyticsEngine {
  private db: any = null;
  private connection: any = null;
  private connectionString: string;
  private isAvailable: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {
    const dbConfig = {
      host: this.configService.get('database.host'),
      port: this.configService.get('database.port'),
      name: this.configService.get('database.name'),
      user: this.configService.get('database.user'),
      password: this.configService.get('database.password'),
    };
    
    this.connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`;
    this.initPromise = this.initializeDatabase();
  }

  /**
   * Initializes the in-memory DuckDB database and loads the postgres extension.
   */
  private async initializeDatabase(): Promise<void> {
    try {
      const duckdb = require('duckdb');
      
      this.db = new duckdb.Database(':memory:');
      this.connection = this.db.connect();

      await this.runQuery("INSTALL postgres;");
      await this.runQuery("LOAD postgres;");
      
      const attachQuery = `ATTACH '${this.connectionString}' AS pg (TYPE postgres, READ_ONLY);`;
      await this.runQuery(attachQuery);
      
      this.isAvailable = true;
    } catch (error) {
      console.warn('⚠️ DuckDB not available:', error.message);
      this.isAvailable = false;
    }
  }

  /**
   * Helper to run a raw query against the internal DuckDB connection.
   */
  private runQuery(query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error('DuckDB connection not available'));
        return;
      }
      
      this.connection.all(query, (err: any, result: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(result || []);
        }
      });
    });
  }

  /**
   * Convert BigInt values to regular numbers/strings for JSON serialization.
   * JavaScript's JSON.stringify cannot handle BigInt.
   */
  private convertBigInts(data: any[]): any[] {
    return data.map(row => {
      const converted: any = {};
      for (const key of Object.keys(row)) {
        const value = row[key];
        if (typeof value === 'bigint') {
          // Convert BigInt to number if safe, otherwise string
          converted[key] = Number.isSafeInteger(Number(value)) 
            ? Number(value) 
            : value.toString();
        } else if (value instanceof Date) {
          converted[key] = value.toISOString();
        } else {
          converted[key] = value;
        }
      }
      return converted;
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private notAvailableResponse(): any {
    return {
      data: [],
      executionTimeMs: 0,
      rowCount: 0,
      engine: 'duckdb-local',
      error: 'DuckDB not available. Check installation.',
    };
  }

  /**
   * Executes a raw SQL query against DuckDB.
   * @param query - The SQL query string.
   * @param params - Optional parameters (unused in this implementation).
   */
  async executeQuery(query: string, params: any[] = []): Promise<{
    data: any[];
    executionTimeMs: number;
    rowCount: number;
  }> {
    await this.ensureInitialized();
    
    if (!this.isAvailable) {
      return this.notAvailableResponse();
    }

    const startTime = Date.now();
    const result = await this.runQuery(query);
    const executionTimeMs = Date.now() - startTime;

    return {
      data: this.convertBigInts(result),
      executionTimeMs,
      rowCount: result.length,
    };
  }

  async getRevenueByMerchant(limit?: number): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.isAvailable) {
      return this.notAvailableResponse();
    }

    const query = `
      SELECT 
        m.merchant_id,
        m.merchant_name,
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction
      FROM pg.public.transactions t
      JOIN pg.public.merchants m ON t.merchant_id = m.merchant_id
      WHERE t.status = 'completed'
      GROUP BY m.merchant_id, m.merchant_name, m.category
      ORDER BY total_revenue DESC
    `;

    const startTime = Date.now();
    try {
      const result = await this.runQuery(query);
      const executionTimeMs = Date.now() - startTime;

      return {
        data: this.convertBigInts(result),
        executionTimeMs,
        rowCount: result.length,
        engine: 'duckdb-local',
        query: query.trim(),
      };
    } catch (error) {
      return {
        data: [],
        executionTimeMs: Date.now() - startTime,
        rowCount: 0,
        engine: 'duckdb-local',
        error: error.message,
      };
    }
  }

  async getDailyTransactions(days?: number): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.isAvailable) {
      return this.notAvailableResponse();
    }

    const query = `
      SELECT 
        CAST(transaction_time AS DATE) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM pg.public.transactions
      GROUP BY CAST(transaction_time AS DATE)
      ORDER BY date DESC
    `;

    const startTime = Date.now();
    try {
      const result = await this.runQuery(query);
      const executionTimeMs = Date.now() - startTime;

      return {
        data: this.convertBigInts(result),
        executionTimeMs,
        rowCount: result.length,
        engine: 'duckdb-local',
        query: query.trim(),
      };
    } catch (error) {
      return {
        data: [],
        executionTimeMs: Date.now() - startTime,
        rowCount: 0,
        engine: 'duckdb-local',
        error: error.message,
      };
    }
  }

  async getCustomerSpending(limit?: number): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.isAvailable) {
      return this.notAvailableResponse();
    }

    const query = `
      SELECT 
        c.customer_id,
        c.name,
        c.email,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_spent,
        AVG(t.amount) as avg_transaction,
        MIN(t.transaction_time) as first_transaction,
        MAX(t.transaction_time) as last_transaction
      FROM pg.public.customers c
      JOIN pg.public.transactions t ON c.customer_id = t.customer_id
      WHERE t.status = 'completed'
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_spent DESC
    `;

    const startTime = Date.now();
    try {
      const result = await this.runQuery(query);
      const executionTimeMs = Date.now() - startTime;

      return {
        data: this.convertBigInts(result),
        executionTimeMs,
        rowCount: result.length,
        engine: 'duckdb-local',
        query: query.trim(),
      };
    } catch (error) {
      return {
        data: [],
        executionTimeMs: Date.now() - startTime,
        rowCount: 0,
        engine: 'duckdb-local',
        error: error.message,
      };
    }
  }

  async getCategoryDistribution(): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.isAvailable) {
      return this.notAvailableResponse();
    }

    const query = `
      SELECT 
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        COUNT(DISTINCT t.merchant_id) as merchant_count,
        ROUND(COUNT(t.transaction_id) * 100.0 / SUM(COUNT(t.transaction_id)) OVER (), 2) as percentage
      FROM pg.public.transactions t
      JOIN pg.public.merchants m ON t.merchant_id = m.merchant_id
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `;

    const startTime = Date.now();
    try {
      const result = await this.runQuery(query);
      const executionTimeMs = Date.now() - startTime;

      return {
        data: this.convertBigInts(result),
        executionTimeMs,
        rowCount: result.length,
        engine: 'duckdb-local',
        query: query.trim(),
      };
    } catch (error) {
      return {
        data: [],
        executionTimeMs: Date.now() - startTime,
        rowCount: 0,
        engine: 'duckdb-local',
        error: error.message,
      };
    }
  }

  async getStatusSummary(): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.isAvailable) {
      return this.notAvailableResponse();
    }

    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM pg.public.transactions
      GROUP BY status
      ORDER BY count DESC
    `;

    const startTime = Date.now();
    try {
      const result = await this.runQuery(query);
      const executionTimeMs = Date.now() - startTime;

      return {
        data: this.convertBigInts(result),
        executionTimeMs,
        rowCount: result.length,
        engine: 'duckdb-local',
        query: query.trim(),
      };
    } catch (error) {
      return {
        data: [],
        executionTimeMs: Date.now() - startTime,
        rowCount: 0,
        engine: 'duckdb-local',
        error: error.message,
      };
    }
  }
}
