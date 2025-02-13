import { drizzle } from 'drizzle-orm/postgres-js';
import 'dotenv/config';
import postgres from 'postgres';
import * as schema from './schema.js';


const url = process.env.POSTGRES_URL;
if (!url) {
  throw new Error('POSTGRES_URL is not set');
}
const queryClient = postgres(url);
export const db = drizzle({ client: queryClient, schema: { ...schema } });
