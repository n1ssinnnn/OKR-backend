CREATE TABLE "department" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "firstName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lastName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'employee' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "departmentId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "positionId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_departmentId_department_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."department"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_positionId_position_id_fk" FOREIGN KEY ("positionId") REFERENCES "public"."position"("id") ON DELETE restrict ON UPDATE no action;