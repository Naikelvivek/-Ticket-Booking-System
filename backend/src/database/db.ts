import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Allow DATABASE_URL or explicit PG_* env vars. Provide sensible local defaults when missing.
const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'admin',
      database: process.env.PGDATABASE || 'postgres',
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
