import { sendEmail } from "../utils/mailer.js";
import { APP_NAME, escapeHtml, emailLayout } from "./layout.js";

/**
 * Student: first personal tutor assignment.
 */
export function notifyStudentTutorAssigned(studentEmail, studentName, tutorName) {
  if (!studentEmail) return;
  const subject = `${APP_NAME}: Your personal tutor has been assigned`;
  const body = emailLayout(`
      <h2>You have been assigned a personal tutor</h2>
      <p>Dear ${escapeHtml(studentName || "Student")},</p>
      <p><strong>${escapeHtml(tutorName || "Your tutor")}</strong> has been assigned as your personal tutor.</p>
      <p>Please log in to ${APP_NAME} for next steps.</p>
    `);
  return sendEmail(studentEmail, subject, body).catch((err) =>
    console.error("Failed to send tutor assignment email:", err.message),
  );
}

/**
 * Student: tutor changed (reallocation).
 */
export function notifyStudentTutorReallocated(
  studentEmail,
  studentName,
  newTutorName,
  previousTutorName,
) {
  if (!studentEmail) return;
  const subject = `${APP_NAME}: Your personal tutor has been updated`;
  const prev = previousTutorName
    ? `Your previous tutor was <strong>${escapeHtml(previousTutorName)}</strong>. `
    : "";
  const body = emailLayout(`
      <h2>Your personal tutor has changed</h2>
      <p>Dear ${escapeHtml(studentName || "Student")},</p>
      <p>${prev}Your new personal tutor is <strong>${escapeHtml(newTutorName || "your tutor")}</strong>.</p>
      <p>Please log in to ${APP_NAME} for next steps.</p>
    `);
  return sendEmail(studentEmail, subject, body).catch((err) =>
    console.error("Failed to send tutor reallocation email:", err.message),
  );
}
