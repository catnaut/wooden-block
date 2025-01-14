CREATE TABLE "hits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "total_hits" (
	"id" serial PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "hits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "timestamp_idx" ON "hits" USING btree ("timestamp");