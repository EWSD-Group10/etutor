-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('login', 'message_sent', 'meeting_created', 'document_uploaded');

-- CreateTable
CREATE TABLE "user_activity_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activity_events_user_id_created_at_idx" ON "user_activity_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_activity_events_created_at_idx" ON "user_activity_events"("created_at");

-- AddForeignKey
ALTER TABLE "user_activity_events" ADD CONSTRAINT "user_activity_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
