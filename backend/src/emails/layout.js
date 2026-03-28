export const APP_NAME = "eTutor";

export function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared HTML wrapper for transactional emails. */
export function emailLayout(innerHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${innerHtml}
      <p style="margin-top: 24px; color: #666; font-size: 12px;">This is an automated message from ${APP_NAME}.</p>
    </div>
  `;
}
