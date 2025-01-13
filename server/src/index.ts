import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from '@/db/index.js'
import { count, eq, desc } from 'drizzle-orm'
import { hits, rooms } from './db/schema.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// 创建房间的请求体验证
const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
})

// 房间相关的 CRUD 接口
app.post('/rooms', zValidator('json', createRoomSchema), async (c) => {
  const { name } = await c.req.json()
  try {
    const [room] = await db.insert(rooms).values({
      name,
    }).returning()
    return c.json({ status: 'success', data: room }, 201)
  } catch (error) {
    console.error(error)
    return c.json({ status: 'error', message: '创建房间失败' }, 500)
  }
})

// 获取所有房间
app.get('/rooms', async (c) => {
  try {
    const roomsList = await db.select().from(rooms).orderBy(desc(rooms.createdAt))
    return c.json({ status: 'success', data: roomsList })
  } catch (error) {
    return c.json({ status: 'error', message: '获取房间列表失败' }, 500)
  }
})

// 获取单个房间
app.get('/rooms/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const room = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)
    if (!room.length) {
      return c.json({ status: 'error', message: '房间不存在' }, 404)
    }
    return c.json({ status: 'success', data: room[0] })
  } catch (error) {
    return c.json({ status: 'error', message: '获取房间信息失败' }, 500)
  }
})

// 更新房间
app.put('/rooms/:id', zValidator('json', createRoomSchema), async (c) => {
  const id = c.req.param('id')
  const { name } = await c.req.json()
  try {
    const [updated] = await db.update(rooms)
      .set({ name })
      .where(eq(rooms.id, id))
      .returning()
    
    if (!updated) {
      return c.json({ status: 'error', message: '房间不存在' }, 404)
    }
    return c.json({ status: 'success', data: updated })
  } catch (error) {
    return c.json({ status: 'error', message: '更新房间失败' }, 500)
  }
})

// 删除房间
app.delete('/rooms/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const [deleted] = await db.delete(rooms)
      .where(eq(rooms.id, id))
      .returning()
    
    if (!deleted) {
      return c.json({ status: 'error', message: '房间不存在' }, 404)
    }
    return c.json({ status: 'success', data: deleted })
  } catch (error) {
    return c.json({ status: 'error', message: '删除房间失败' }, 500)
  }
})

// Hits 相关接口
// 获取总点击数
app.get('/hits/count', async (c) => {
  try {
    const [result] = await db.select({ value: count() }).from(hits)
    return c.json({ status: 'success', data: { count: result.value } })
  } catch (error) {
    return c.json({ status: 'error', message: '获取点击数失败' }, 500)
  }
})

// 获取特定房间的点击数
app.get('/rooms/:id/hits/count', async (c) => {
  const roomId = c.req.param('id')
  try {
    const [result] = await db
      .select({ value: count() })
      .from(hits)
      .where(eq(hits.roomId, roomId))
    return c.json({ status: 'success', data: { count: result.value } })
  } catch (error) {
    return c.json({ status: 'error', message: '获取房间点击数失败' }, 500)
  }
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
