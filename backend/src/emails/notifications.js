import { sendEmail } from "../utils/mailer.js";
import { APP_NAME, escapeHtml, emailLayout } from "./layout.js";

/**
 * Maps a notification type + metadata to an email subject and HTML body.
 * Returns null if no email should be sent for this type.
 */
export function buildNotificationEmail(type, recipientName, message, metadata) {
  const name = escapeHtml(recipientName || "there");

  switch (type) {
    case "tutor_assigned": {
      const tutorName = escapeHtml(metadata?.tutorName || "your tutor");
      return {
        subject: `${APP_NAME}: Your personal tutor has been assigned`,
        body: emailLayout(`
          <h2>You have been assigned a personal tutor</h2>
          <p>Dear ${name},</p>
          <p><strong>${tutorName}</strong> has been assigned as your personal tutor.</p>
          <p>Please log in to <strong>${APP_NAME}</strong> to get started.</p>
        `),
      };
    }

    case "tutor_reallocated": {
      const newTutor = escapeHtml(metadata?.tutorName || "your new tutor");
      const prevTutor = metadata?.previousTutorName
        ? `Your previous tutor was <strong>${escapeHtml(metadata.previousTutorName)}</strong>. `
        : "";
      return {
        subject: `${APP_NAME}: Your personal tutor has been updated`,
        body: emailLayout(`
          <h2>Your personal tutor has changed</h2>
          <p>Dear ${name},</p>
          <p>${prevTutor}Your new personal tutor is <strong>${newTutor}</strong>.</p>
          <p>Please log in to <strong>${APP_NAME}</strong> for next steps.</p>
        `),
      };
    }

    case "student_assigned": {
      const studentName = escapeHtml(metadata?.studentName || "a student");
      return {
        subject: `${APP_NAME}: A student has been assigned to you`,
        body: emailLayout(`
          <h2>A new student has been assigned to you</h2>
          <p>Dear ${name},</p>
          <p><strong>${studentName}</strong> has been assigned to you for academic support.</p>
          <p>Please log in to <strong>${APP_NAME}</strong> to get in touch with your new student.</p>
        `),
      };
    }

    case "meeting_scheduled": {
      const meetingName = escapeHtml(metadata?.meetingName || "a meeting");
      const scheduledAt = metadata?.scheduledAt
        ? new Date(metadata.scheduledAt).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;
      const meetingType = escapeHtml(metadata?.meetingType || "");
      const location = metadata?.location ? escapeHtml(metadata.location) : null;
      const meetingLink = metadata?.meetingLink ? escapeHtml(metadata.meetingLink) : null;

      const detailRows = [
        scheduledAt ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:600;">Date</td><td style="padding:4px 0;">${scheduledAt}</td></tr>` : "",
        meetingType ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:600;">Type</td><td style="padding:4px 0;">${meetingType}</td></tr>` : "",
        location ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:600;">Location</td><td style="padding:4px 0;">${location}</td></tr>` : "",
        meetingLink ? `<tr><td style="padding:4px 12px 4px 0;color:#666;font-weight:600;">Link</td><td style="padding:4px 0;"><a href="${meetingLink}">${meetingLink}</a></td></tr>` : "",
      ].filter(Boolean).join("");

      return {
        subject: `${APP_NAME}: New meeting scheduled — ${escapeHtml(metadata?.meetingName || "Meeting")}`,
        body: emailLayout(`
          <h2>New Meeting Scheduled</h2>
          <p>Dear ${name},</p>
          <p>A new meeting has been scheduled: <strong>${meetingName}</strong>.</p>
          ${detailRows ? `<table style="margin:16px 0;border-collapse:collapse;">${detailRows}</table>` : ""}
          <p>Please log in to <strong>${APP_NAME}</strong> to accept or reject this meeting.</p>
        `),
      };
    }

    case "meeting_accepted": {
      const meetingName = escapeHtml(metadata?.meetingName || "the meeting");
      const acceptedBy = escapeHtml(metadata?.actionBy || "the other participant");
      return {
        subject: `${APP_NAME}: Meeting accepted — ${escapeHtml(metadata?.meetingName || "Meeting")}`,
        body: emailLayout(`
          <h2>Meeting Accepted</h2>
          <p>Dear ${name},</p>
          <p><strong>${acceptedBy}</strong> has accepted the meeting: <strong>${meetingName}</strong>.</p>
          <p>Please log in to <strong>${APP_NAME}</strong> for full meeting details.</p>
        `),
      };
    }

    case "meeting_rejected": {
      const meetingName = escapeHtml(metadata?.meetingName || "the meeting");
      const rejectedBy = escapeHtml(metadata?.actionBy || "the other participant");
      return {
        subject: `${APP_NAME}: Meeting rejected — ${escapeHtml(metadata?.meetingName || "Meeting")}`,
        body: emailLayout(`
          <h2>Meeting Rejected</h2>
          <p>Dear ${name},</p>
          <p><strong>${rejectedBy}</strong> has rejected the meeting: <strong>${meetingName}</strong>.</p>
          <p>Please log in to <strong>${APP_NAME}</strong> to reschedule if needed.</p>
        `),
      };
    }

    case "new_document": {
      const fileName = escapeHtml(metadata?.fileName || "a document");
      const sharedBy = escapeHtml(metadata?.sharedBy || "someone");
      return {
        subject: `${APP_NAME}: New document shared — ${escapeHtml(metadata?.fileName || "Document")}`,
        body: emailLayout(`
          <h2>New Document Shared</h2>
          <p>Dear ${name},</p>
          <p><strong>${sharedBy}</strong> has shared a document with you: <strong>${fileName}</strong>.</p>
          <p>Please log in to <strong>${APP_NAME}</strong> to view and download it.</p>
        `),
      };
    }

    default:
      return null;
  }
}

/**
 * Send an email notification for a given notification type.
 * Silently swallows errors so a failed email never blocks the main flow.
 */
export async function sendNotificationEmail(recipientEmail, recipientName, type, message, metadata) {
  if (!recipientEmail) return;
  const email = buildNotificationEmail(type, recipientName, message, metadata);
  if (!email) return;
  return sendEmail(recipientEmail, email.subject, email.body).catch((err) =>
    console.error(`Failed to send ${type} notification email:`, err.message),
  );
}
