-- DropForeignKey
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_student_id_fkey";

-- DropIndex
DROP INDEX "blog_posts_title_idx";

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "group_id" UUID,
ALTER COLUMN "student_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "blog_posts_group_id_idx" ON "blog_posts"("group_id");

-- CreateIndex
CREATE INDEX "blog_posts_tutor_id_idx" ON "blog_posts"("tutor_id");

-- CreateIndex
CREATE INDEX "blog_posts_student_id_idx" ON "blog_posts"("student_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_recipient_id_idx" ON "messages"("recipient_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
