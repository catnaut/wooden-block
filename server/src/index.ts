import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from '@/db/index.js'
import { count } from 'drizzle-orm'
import { hits } from './db/schema.js'

const app = new Hono()

app.get('/hits', async (c) => {
  const result = await db.select({ count: count() }).from(hits)
  return c.json(result)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
