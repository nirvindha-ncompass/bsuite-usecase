import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { AnalyticsEngine } from './engine-selector.service';

/**
 * PostgreSQL Engine (Local)
 * Connects to the local PostgreSQL instance via the `pg` driver.
 * Executes queries directly against the local database.
 */
@Injectable()
export class PostgresqlEngine implements AnalyticsEngine {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  /**
   * Executes a raw SQL query against the local PostgreSQL database.
   * @param query - The SQL query string.
   * @param params - Optional parameters for parameterized queries.
   */
  async executeQuery(query: string, params: any[] = []): Promise<{
    data: any[];
    executionTimeMs: number;
    rowCount: number;
  }> {
    const startTime = Date.now();
    const result = await this.pool.query(query, params);
    const executionTimeMs = Date.now() - startTime;

    return {
      data: result.rows,
      executionTimeMs,
      rowCount: result.rowCount,
    };
  }

  async getRevenueByMerchant(limit?: number): Promise<any> {
    const query = `
      SELECT 
        m.merchant_id,
        m.merchant_name,
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      WHERE t.status = 'completed'
      GROUP BY m.merchant_id, m.merchant_name, m.category
      ORDER BY total_revenue DESC
    `;

    const startTime = Date.now();
    const result = await this.pool.query(query);
    const executionTimeMs = Date.now() - startTime;

    return {
      data: result.rows,
      executionTimeMs,
      rowCount: result.rowCount,
      engine: 'postgresql-local',
      query: query.trim(),
    };
  }

  async getDailyTransactions(days?: number): Promise<any> {
    const query = `
      SELECT 
        DATE(transaction_time) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM transactions
      GROUP BY DATE(transaction_time)
      ORDER BY date DESC
    `;

    const startTime = Date.now();
    const result = await this.pool.query(query);
    const executionTimeMs = Date.now() - startTime;

    return {
      data: result.rows,
      executionTimeMs,
      rowCount: result.rowCount,
      engine: 'postgresql-local',
      query: query.trim(),
    };
  }

  async getCustomerSpending(limit?: number): Promise<any> {
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
      FROM customers c
      JOIN transactions t ON c.customer_id = t.customer_id
      WHERE t.status = 'completed'
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_spent DESC
    `;

    const startTime = Date.now();
    const result = await this.pool.query(query);
    const executionTimeMs = Date.now() - startTime;

    return {
      data: result.rows,
      executionTimeMs,
      rowCount: result.rowCount,
      engine: 'postgresql-local',
      query: query.trim(),
    };
  }

  async getCategoryDistribution(): Promise<any> {
    const query = `
      SELECT 
        m.category,
        COUNT(t.transaction_id) as transaction_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction,
        COUNT(DISTINCT t.customer_id) as unique_customers,
        COUNT(DISTINCT t.merchant_id) as merchant_count,
        ROUND(COUNT(t.transaction_id) * 100.0 / SUM(COUNT(t.transaction_id)) OVER (), 2) as percentage
      FROM transactions t
      JOIN merchants m ON t.merchant_id = m.merchant_id
      GROUP BY m.category
      ORDER BY total_revenue DESC
    `;

    const startTime = Date.now();
    const result = await this.pool.query(query);
    const executionTimeMs = Date.now() - startTime;

    return {
      data: result.rows,
      executionTimeMs,
      rowCount: result.rowCount,
      engine: 'postgresql-local',
      query: query.trim(),
    };
  }

  async getStatusSummary(): Promise<any> {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM transactions
      GROUP BY status
      ORDER BY count DESC
    `;

    const startTime = Date.now();
    const result = await this.pool.query(query);
    const executionTimeMs = Date.now() - startTime;

    return {
      data: result.rows,
      executionTimeMs,
      rowCount: result.rowCount,
      engine: 'postgresql-local',
      query: query.trim(),
    };
  }
}
