CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_room_id_unique" UNIQUE("room_id")
);
--> statement-breakpoint
ALTER TABLE "hits" ADD COLUMN "room_id" uuid NOT NULL;--> statement-breakpoint
CREATE INDEX "room_id_idx" ON "rooms" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "room_id_hits_idx" ON "hits" USING btree ("room_id");