import { prisma } from "../utils/prisma.js"
import { sendNotificationEmail } from "../emails/notifications.js"

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  isRead: true,
  metadata: true,
  createdAt: true,
}

// GET /api/notifications
export const listNotifications = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const filter = req.query.filter // "unread" | "allocations" | "meetings" | "documents"
    const search = req.query.search?.trim() || ""

    const where = { userId }

    if (filter === "unread") {
      where.isRead = false
    } else if (filter === "allocations") {
      where.type = { in: ["tutor_assigned", "tutor_reallocated", "student_assigned"] }
    } else if (filter === "meetings") {
      where.type = { in: ["meeting_scheduled", "meeting_pending", "meeting_accepted", "meeting_rejected", "meeting_updated"] }
    } else if (filter === "documents") {
      where.type = "new_document"
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ]
    }

    const notifications = await prisma.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: { createdAt: "desc" },
    })

    const totalCount = await prisma.notification.count({ where: { userId } })
    const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } })
    const pendingActionsCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        type: "meeting_pending",
      },
    })

    return res.json({
      data: notifications,
      stats: {
        total: totalCount,
        unread: unreadCount,
        pendingActions: pendingActionsCount,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// PUT /api/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) return res.status(404).json({ error: "Notification not found" })
    if (notification.userId !== userId) return res.status(403).json({ error: "Forbidden" })

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: notificationSelect,
    })

    return res.json({ data: updated })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// PUT /api/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    return res.json({ message: "All notifications marked as read" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Helper: create a notification and send an email (used internally by other controllers)
export const createNotification = async ({ userId, type, title, message, metadata = null }) => {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, metadata },
    })

    // Fire-and-forget email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })
    if (user?.email) {
      sendNotificationEmail(user.email, user.name, type, message, metadata)
    }
  } catch (err) {
    console.error("Failed to create notification:", err)
  }
}
