CREATE TYPE "public"."cycle_status" AS ENUM('planning', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."cycle_type" AS ENUM('quarterly', 'annual', 'custom');--> statement-breakpoint
CREATE TYPE "public"."key_result_health" AS ENUM('on_track', 'at_risk', 'off_track');--> statement-breakpoint
CREATE TYPE "public"."key_result_status" AS ENUM('active', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."metric_type" AS ENUM('number', 'percentage', 'currency');--> statement-breakpoint
CREATE TYPE "public"."objective_level" AS ENUM('company', 'department', 'individual');--> statement-breakpoint
CREATE TYPE "public"."objective_status" AS ENUM('draft', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "cycle" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "cycle_type" DEFAULT 'quarterly' NOT NULL,
	"start_at" date NOT NULL,
	"end_at" date NOT NULL,
	"status" "cycle_status" DEFAULT 'planning' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp,
	CONSTRAINT "cycle_dates_check" CHECK ("cycle"."end_at" > "cycle"."start_at")
);
--> statement-breakpoint
CREATE TABLE "key_result" (
	"id" text PRIMARY KEY NOT NULL,
	"objective_id" text NOT NULL,
	"title" text NOT NULL,
	"details" text,
	"metric_type" "metric_type" DEFAULT 'number' NOT NULL,
	"unit" text,
	"start_value" numeric(14, 4) DEFAULT 0 NOT NULL,
	"target_value" numeric(14, 4) NOT NULL,
	"current_value" numeric(14, 4) DEFAULT 0 NOT NULL,
	"weight" numeric(5, 2) DEFAULT 1 NOT NULL,
	"status" "key_result_status" DEFAULT 'active' NOT NULL,
	"health" "key_result_health" DEFAULT 'on_track' NOT NULL,
	"owner_id" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp,
	CONSTRAINT "key_result_target_differs" CHECK ("key_result"."target_value" <> "key_result"."start_value"),
	CONSTRAINT "key_result_weight_positive" CHECK ("key_result"."weight" > 0)
);
--> statement-breakpoint
CREATE TABLE "key_result_check_in" (
	"id" text PRIMARY KEY NOT NULL,
	"key_result_id" text NOT NULL,
	"previous_value" numeric(14, 4) NOT NULL,
	"value" numeric(14, 4) NOT NULL,
	"confidence" integer,
	"note" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_in_confidence_range" CHECK ("key_result_check_in"."confidence" BETWEEN 1 AND 10)
);
--> statement-breakpoint
CREATE TABLE "objective" (
	"id" text PRIMARY KEY NOT NULL,
	"cycle_id" text NOT NULL,
	"parent_objective_id" text,
	"department_id" text,
	"title" text NOT NULL,
	"details" text,
	"level" "objective_level" NOT NULL,
	"status" "objective_status" DEFAULT 'draft' NOT NULL,
	"progress" numeric(5, 2) DEFAULT 0 NOT NULL,
	"owner_id" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp,
	CONSTRAINT "objective_progress_range" CHECK ("objective"."progress" BETWEEN 0 AND 100),
	CONSTRAINT "objective_level_department_match" CHECK (("objective"."level" = 'company') = ("objective"."department_id" IS NULL)),
	CONSTRAINT "objective_not_self_parent" CHECK ("objective"."parent_objective_id" <> "objective"."id")
);
--> statement-breakpoint
ALTER TABLE "cycle" ADD CONSTRAINT "cycle_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle" ADD CONSTRAINT "cycle_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle" ADD CONSTRAINT "cycle_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result" ADD CONSTRAINT "key_result_objective_id_objective_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."objective"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result" ADD CONSTRAINT "key_result_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result" ADD CONSTRAINT "key_result_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result" ADD CONSTRAINT "key_result_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result" ADD CONSTRAINT "key_result_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result_check_in" ADD CONSTRAINT "key_result_check_in_key_result_id_key_result_id_fk" FOREIGN KEY ("key_result_id") REFERENCES "public"."key_result"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result_check_in" ADD CONSTRAINT "key_result_check_in_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_cycle_id_cycle_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_parent_objective_id_objective_id_fk" FOREIGN KEY ("parent_objective_id") REFERENCES "public"."objective"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cycle_status_idx" ON "cycle" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "cycle_single_active_idx" ON "cycle" USING btree ("status") WHERE "cycle"."status" = 'active' AND "cycle"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "key_result_objectiveId_idx" ON "key_result" USING btree ("objective_id");--> statement-breakpoint
CREATE INDEX "key_result_ownerId_idx" ON "key_result" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "check_in_keyResultId_createdAt_idx" ON "key_result_check_in" USING btree ("key_result_id","created_at");--> statement-breakpoint
CREATE INDEX "objective_cycle_level_department_idx" ON "objective" USING btree ("cycle_id","level","department_id") WHERE "objective"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "objective_ownerId_idx" ON "objective" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "objective_departmentId_idx" ON "objective" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "objective_parentObjectiveId_idx" ON "objective" USING btree ("parent_objective_id");