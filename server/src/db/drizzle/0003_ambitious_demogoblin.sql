ALTER TABLE "rooms" DROP CONSTRAINT "rooms_room_id_unique";--> statement-breakpoint
DROP INDEX "room_id_idx";--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
CREATE INDEX "room_id_idx" ON "rooms" USING btree ("id");--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "room_id";