import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createNodeWebSocket } from '@hono/node-ws'
import type { WSContext } from 'hono/ws'

import { db } from '@/db/index.js'
import { count, eq, desc } from 'drizzle-orm'
import { hits, rooms } from './db/schema.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// 创建 WebSocket 实例
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

// 添加内存中的计数器和连接管理
let totalClicks = 0
const connections = new Map<WSContext<unknown>, { id: string }>()

// 定义消息类型
type ClickMessage = {
  type: 'clicks'
  clicks: { timestamp: number }[]
}

type InitMessage = {
  type: 'init'
  totalClicks: number
}

// 广播消息给其他客户端
const broadcastMessage = (sender: WSContext<unknown>, message: any) => {
  const messageStr = JSON.stringify(message)
  connections.forEach((_, client) => {
    if (client !== sender && client.readyState === 1) { // WebSocket.OPEN = 1
      client.send(messageStr)
    }
  })
}

app.get('/ws', upgradeWebSocket((c) => ({
  onMessage(event, ws) {
    try {
      const message = JSON.parse(event.data.toString())
      
      if (message.type === 'clicks') {
        // 更新总点击数
        totalClicks += message.clicks.length
        
        // 广播给其他连接
        broadcastMessage(ws, message)
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  },
  
  onOpen(event, ws) {
    // 生成唯一ID并保存连接信息
    const connectionId = Math.random().toString(36).substring(2, 15)
    connections.set(ws, { id: connectionId })
    
    // 发送初始化数据
    const initMessage: InitMessage = {
      type: 'init',
      totalClicks
    }
    ws.send(JSON.stringify(initMessage))
    
    console.log('Client connected, total connections:', connections.size)
  },
  
  onClose(event, ws) {
    // 从连接集合中移除
    connections.delete(ws)
    console.log('Client disconnected, total connections:', connections.size)
  },
  
  onError(event, ws) {
    console.error('WebSocket error:', event)
    connections.delete(ws)
  }
})))

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

const server = serve({
  fetch: app.fetch,
  port
})

injectWebSocket(server)