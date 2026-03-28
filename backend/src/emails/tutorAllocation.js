import { sendEmail } from "../utils/mailer.js";
import { APP_NAME, escapeHtml, emailLayout } from "./layout.js";

/**
 * Tutor: assigned a student (new allocation or incoming reallocation).
 * @param {string | null | undefined} previousTutorName - set when student was reassigned from another tutor
 */
export function notifyTutorGainedStudent(
  tutorEmail,
  tutorName,
  studentName,
  previousTutorName,
) {
  if (!tutorEmail) return;
  const isReallocate = Boolean(previousTutorName);
  const subject = isReallocate
    ? `${APP_NAME}: A student has been reassigned to you`
    : `${APP_NAME}: You have a new tutee`;
  const reallocateLine = isReallocate
    ? `<p>They were previously assigned to <strong>${escapeHtml(previousTutorName)}</strong>.</p>`
    : "";
  const body = emailLayout(`
      <h2>${isReallocate ? "New tutee assignment" : "New tutee"}</h2>
      <p>Dear ${escapeHtml(tutorName || "Tutor")},</p>
      <p><strong>${escapeHtml(studentName || "A student")}</strong> is now assigned to you as their personal tutor.</p>
      ${reallocateLine}
      <p>Please log in to ${APP_NAME} for next steps.</p>
    `);
  return sendEmail(tutorEmail, subject, body).catch((err) =>
    console.error("Failed to send tutor gained-tutee email:", err.message),
  );
}

/**
 * Tutor: student reassigned away from them.
 */
export function notifyTutorLostStudent(tutorEmail, tutorName, studentName) {
  if (!tutorEmail) return;
  const subject = `${APP_NAME}: A tutee has been reassigned`;
  const body = emailLayout(`
      <h2>Tutee reassigned</h2>
      <p>Dear ${escapeHtml(tutorName || "Tutor")},</p>
      <p><strong>${escapeHtml(studentName || "A student")}</strong> is no longer assigned to you as their personal tutor.</p>
      <p>Please log in to ${APP_NAME} for next steps.</p>
    `);
  return sendEmail(tutorEmail, subject, body).catch((err) =>
    console.error("Failed to send tutor lost-tutee email:", err.message),
  );
}
