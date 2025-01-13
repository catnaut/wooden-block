CREATE TABLE "hits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "hits_user_id_idx" ON "hits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "hits_timestamp_idx" ON "hits" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "hits_room_id_idx" ON "hits" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "rooms_id_idx" ON "rooms" USING btree ("id");