-- CreateTable
CREATE TABLE "inactivity_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inactivity_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inactivity_notifications_student_id_sent_at_idx" ON "inactivity_notifications"("student_id", "sent_at");
