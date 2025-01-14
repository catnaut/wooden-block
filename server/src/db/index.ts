import { drizzle } from 'drizzle-orm/postgres-js';
import 'dotenv/config';
import postgres from 'postgres';


const url = process.env.POSTGRES_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set');
}
const queryClient = postgres(url);
export const db = drizzle({ client: queryClient });
