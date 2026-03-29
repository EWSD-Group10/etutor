import { prisma } from "./prisma.js";

/** @typedef {'login'|'message_sent'|'meeting_created'|'document_uploaded'} ActivityActionValue */

/**
 * Fire-and-forget activity row for admin "most active users" (does not block request on failure).
 * If the Prisma client is stale (no `userActivityEvent` delegate), skip quietly — run `npx prisma generate` and restart the API.
 * @param {string} userId
 * @param {ActivityActionValue} action
 */
export function logUserActivity(userId, action, userAgent = null, ipAddress = null) {
  if (!userId || !action) return;
  const delegate = prisma.userActivityEvent;
  if (!delegate || typeof delegate.create !== "function") {
    return;
  }
  delegate
    .create({
      data: {
        userId,
        action,
        userAgent,
        ipAddress,
      },
    })
    .catch((err) => console.error("logUserActivity:", err.message));
}
