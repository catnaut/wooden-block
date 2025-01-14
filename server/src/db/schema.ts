import { pgTable, serial, uuid, timestamp, index, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 房间表
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('room_id_idx').on(table.id),
]);

// 点击事件表
export const hits = pgTable('hits', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  roomId: uuid('room_id').notNull(), // 关联到 rooms 表
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => [
  index('user_id_idx').on(table.userId),
  index('timestamp_idx').on(table.timestamp),
  index('room_id_hits_idx').on(table.roomId),
]);

// 定义关系
export const roomsRelations = relations(rooms, ({ many }) => ({
  hits: many(hits),
}));

export const hitsRelations = relations(hits, ({ one }) => ({
  room: one(rooms, {
    fields: [hits.roomId],
    references: [rooms.id],
  }),
}));
