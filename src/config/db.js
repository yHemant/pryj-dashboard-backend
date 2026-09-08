import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Prevent node-postgres from converting PostgreSQL DATE into UTC JavaScript Date
// Return raw 'YYYY-MM-DD' string directly
pg.types.setTypeParser(1082, (val) => val);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
export default pool;