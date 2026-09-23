const path = require('path');
const dotenv = require('dotenv');

// Load environment variables reliably from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.MYSQL_URL;

const isPostgres = dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'));

let pool;

if (isPostgres) {
  const { Pool } = require('pg');

  const pgPool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  /**
   * Helper that translates MySQL syntax to PostgreSQL syntax:
   * 1. Replaces ? placeholders with $1, $2, ...
   * 2. Replaces DATE_FORMAT(expr, '%b') with TO_CHAR(expr, 'Mon')
   * 3. Replaces DATE_FORMAT(expr, '%Y-%m-%d') with TO_CHAR(expr, 'YYYY-MM-DD')
   * 4. Replaces MONTH(expr) with CAST(EXTRACT(MONTH FROM expr) AS INTEGER)
   * 5. Replaces YEAR(expr) with CAST(EXTRACT(YEAR FROM expr) AS INTEGER)
   * 6. Replaces CAST(expr AS CHAR) with CAST(expr AS TEXT)
   * 7. Quotes aliases (AS fooBar -> AS "fooBar") so Postgres preserves camelCase
   */
  function adaptSqlForPostgres(sql) {
    let pIndex = 1;
    let adapted = sql
      .replace(/DATE_FORMAT\s*\(\s*([^,]+)\s*,\s*'%b'\s*\)/gi, "TO_CHAR($1, 'Mon')")
      .replace(/DATE_FORMAT\s*\(\s*([^,]+)\s*,\s*'%Y-%m-%d'\s*\)/gi, "TO_CHAR($1, 'YYYY-MM-DD')")
      .replace(/MONTH\s*\(\s*([^)]+)\s*\)/gi, "EXTRACT(MONTH FROM $1)")
      .replace(/YEAR\s*\(\s*([^)]+)\s*\)/gi, "EXTRACT(YEAR FROM $1)")
      .replace(/CAST\s*\(\s*([^)]+)\s+AS\s+CHAR\s*\)/gi, "CAST($1 AS TEXT)")
      .replace(/`/g, '"');

    // Quote unquoted AS aliases except SQL types
    const reservedTypes = new Set(['TEXT', 'VARCHAR', 'INTEGER', 'INT', 'NUMERIC', 'DECIMAL', 'BOOLEAN', 'DATE', 'TIMESTAMP']);
    adapted = adapted.replace(/\bAS\s+([a-zA-Z][a-zA-Z0-9_]*)\b/gi, (match, alias) => {
      if (reservedTypes.has(alias.toUpperCase())) return match;
      return `AS "${alias}"`;
    });

    // Replace ? with $1, $2, etc.
    adapted = adapted.replace(/\?/g, () => `$${pIndex++}`);
    return adapted;
  }

  function normalizeRows(rows) {
    if (!Array.isArray(rows)) return rows;
    return rows.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const normalized = { ...row };

      // Also map snake_case to camelCase and lowercase to original
      for (const [k, v] of Object.entries(row)) {
        if (k.includes('_')) {
          const camel = k.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
          if (!(camel in normalized)) {
            normalized[camel] = v;
          }
        }
      }

      return new Proxy(normalized, {
        get(target, prop) {
          if (typeof prop !== 'string') return target[prop];
          if (prop in target) return target[prop];
          const lower = prop.toLowerCase();
          if (lower in target) return target[lower];
          for (const key of Object.keys(target)) {
            if (key.toLowerCase() === lower) return target[key];
          }
          return undefined;
        },
      });
    });
  }

  // Wrapped pool adhering to mysql2 [rows, fields] convention
  pool = {
    isPostgres: true,
    pgPool,
    async query(sql, params = []) {
      const adaptedSql = adaptSqlForPostgres(sql);
      const res = await pgPool.query(adaptedSql, params);
      return [normalizeRows(res.rows), res.fields];
    },
    async getConnection() {
      const client = await pgPool.connect();
      return {
        async query(sql, params = []) {
          const adaptedSql = adaptSqlForPostgres(sql);
          const res = await client.query(adaptedSql, params);
          return [normalizeRows(res.rows), res.fields];
        },
        release() {
          client.release();
        },
      };
    },
  };

  // Test Neon connection on boot
  (async () => {
    try {
      const client = await pgPool.connect();
      console.log('[Database] Connected successfully to Neon PostgreSQL database!');
      client.release();
    } catch (error) {
      console.error('[Database] Neon PostgreSQL connection error:', error.message);
    }
  })();
} else {
  // Standard MySQL driver
  const mysql = require('mysql2/promise');

  const poolConfig = dbUrl
    ? {
        uri: dbUrl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        decimalNumbers: true,
        ssl:
          process.env.DB_SSL === 'false'
            ? undefined
            : process.env.DB_SSL === 'true' || dbUrl.includes('ssl')
            ? { rejectUnauthorized: false }
            : undefined,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sales_analytics',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        decimalNumbers: true,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      };

  pool = mysql.createPool(poolConfig);

  (async () => {
    try {
      const connection = await pool.getConnection();
      console.log(
        `[Database] Connected successfully to MySQL database "${process.env.DB_NAME || 'sales_analytics'}" at ${
          process.env.DB_HOST || 'localhost'
        }`
      );
      connection.release();
    } catch (error) {
      console.error('[Database] MySQL connection error:', error.message);
    }
  })();
}

module.exports = pool;
