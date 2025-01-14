import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from '@/db/index.js'

const app = new Hono()

app.get('/', async (c) => {
  return c.text(`Hello Hono!`)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
