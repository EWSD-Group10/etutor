import cron from "node-cron";
import { prisma } from "../utils/prisma.js";
import { sendEmail } from "../utils/mailer.js";

const INACTIVITY_THRESHOLD_DAYS = 28;
const NOTIFICATION_COOLDOWN_DAYS = 7;

async function getLastInteractionDate(studentId) {
  const [lastMessage, lastComment, lastMeeting, lastDocument, lastBlogPost] =
    await Promise.all([
      prisma.message.findFirst({
        where: { senderId: studentId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.comment.findFirst({
        where: { commenterId: studentId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.meeting.findFirst({
        where: {
          studentId: studentId,
          meetingStatus: { not: "cancelled" },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.document.findFirst({
        where: { uploaderId: studentId },
        orderBy: { uploadedAt: "desc" },
        select: { uploadedAt: true },
      }),
      prisma.blogPost.findFirst({
        where: { studentId: studentId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

  const dates = [
    lastMessage?.createdAt,
    lastComment?.createdAt,
    lastMeeting?.createdAt,
    lastDocument?.uploadedAt,
    lastBlogPost?.createdAt,
  ].filter(Boolean);

  if (dates.length === 0) return null;

  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

async function wasRecentlyNotified(studentId) {
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - NOTIFICATION_COOLDOWN_DAYS);

  const existing = await prisma.inactivityNotification.findFirst({
    where: {
      studentId: studentId,
      sentAt: { gte: cooldownDate },
    },
  });

  return !!existing;
}

async function recordNotification(studentId) {
  await prisma.inactivityNotification.create({
    data: { studentId },
  });
}

function buildStudentEmailBody(studentName, daysSinceActivity) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>eTutor Inactivity Notice</h2>
      <p>Dear ${studentName || "Student"},</p>
      <p>We noticed that you have not had any activity on eTutor for
         <strong>${daysSinceActivity} days</strong>.</p>
      <p>Regular engagement with your tutor is important for your academic progress.
         Activities include:</p>
      <ul>
        <li>Sending messages to your tutor</li>
        <li>Commenting on blog posts</li>
        <li>Attending or scheduling meetings</li>
        <li>Uploading documents</li>
      </ul>
      <p>Please log in and connect with your tutor at your earliest convenience.</p>
      <p>Best regards,<br/>The eTutor Team</p>
    </div>
  `;
}

function buildTutorEmailBody(
  tutorName,
  studentName,
  studentEmail,
  daysSinceActivity,
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>eTutor - Student Inactivity Alert</h2>
      <p>Dear ${tutorName || "Tutor"},</p>
      <p>Your student <strong>${studentName || studentEmail}</strong>
         (${studentEmail}) has not had any activity on eTutor for
         <strong>${daysSinceActivity} days</strong>.</p>
      <p>We recommend reaching out to check on their progress and encourage
         them to re-engage with the platform.</p>
      <p>Best regards,<br/>The eTutor Team</p>
    </div>
  `;
}

async function checkInactiveStudents() {
  console.log(`[InactivityCheck] Running at ${new Date().toISOString()}`);

  try {
    const students = await prisma.user.findMany({
      where: { role: "student", isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - INACTIVITY_THRESHOLD_DAYS);

    let notifiedCount = 0;

    for (const student of students) {
      try {
        if (await wasRecentlyNotified(student.id)) {
          continue;
        }

        const lastActivity = await getLastInteractionDate(student.id);

        const referenceDate = lastActivity || student.createdAt;
        if (referenceDate > thresholdDate) {
          continue;
        }

        const daysSinceActivity = Math.floor(
          (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        const allocation = await prisma.allocation.findUnique({
          where: { studentId: student.id },
          include: {
            tutor: { select: { id: true, email: true, name: true } },
          },
        });

        await sendEmail(
          student.email,
          "eTutor: You've been inactive - please reconnect",
          buildStudentEmailBody(student.name, daysSinceActivity),
        );

        if (allocation?.tutor) {
          await sendEmail(
            allocation.tutor.email,
            `eTutor: Your student ${student.name || student.email} has been inactive`,
            buildTutorEmailBody(
              allocation.tutor.name,
              student.name,
              student.email,
              daysSinceActivity,
            ),
          );
        } else {
          console.warn(
            `[InactivityCheck] Student ${student.email} has no tutor allocation. Only student was notified.`,
          );
        }

        await recordNotification(student.id);
        notifiedCount++;
      } catch (err) {
        console.error(
          `[InactivityCheck] Error processing student ${student.email}:`,
          err.message,
        );
      }
    }

    console.log(
      `[InactivityCheck] Complete. Checked ${students.length} students, notified ${notifiedCount}.`,
    );
  } catch (err) {
    console.error("[InactivityCheck] Fatal error:", err);
  }
}

export function startInactivityCron() {
  cron.schedule("0 0 * * *", checkInactiveStudents);
  console.log("[InactivityCheck] Cron job scheduled - daily at midnight");
}

export { checkInactiveStudents };
