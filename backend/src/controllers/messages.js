import { prisma } from "../utils/prisma.js"
import { canDirectInteract, getUserBasic, getVisibleUserIds } from "../utils/relationship.js"

// GET /api/messages?withUserId=&page=1&limit=20
export const listMessages = async (req, res) => {
  try {
    const userId = req.user?.id
    const withUserId = req.query.withUserId
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    if (!userId || !withUserId) {
      return res.status(400).json({ error: "withUserId is required" })
    }

    const allowed = await canDirectInteract(userId, withUserId)
    if (!allowed) return res.status(403).json({ error: "Not allowed" })

    // Get total count for pagination
    const total = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, recipientId: withUserId },
          { senderId: withUserId, recipientId: userId },
        ],
      },
    })

    const data = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: withUserId },
          { senderId: withUserId, recipientId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        recipient: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: withUserId,
        recipientId: userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    return res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id
    const { recipientId, content } = req.body

    if (!userId || !recipientId || !content?.trim()) {
      return res.status(400).json({ error: "recipientId and content are required" })
    }

    const me = await getUserBasic(userId)
    if (!me || me.role === "admin") {
      return res.status(403).json({ error: "Admins cannot send direct messages here" })
    }

    const allowed = await canDirectInteract(userId, recipientId)
    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Messaging allowed only within student-tutor relationship" })
    }

    const data = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        recipient: { select: { id: true, name: true, role: true } },
      },
    })

    return res.status(201).json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/messages/inbox
export const listInbox = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const rows = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        content: true,
        createdAt: true,
        readAt: true,
      },
      take: 1000,
    })

    const peers = new Map()
    for (const row of rows) {
      const peerId = row.senderId === userId ? row.recipientId : row.senderId
      if (!peers.has(peerId)) peers.set(peerId, row)
    }

    const peerIds = [...peers.keys()]
    const users = await prisma.user.findMany({
      where: { id: { in: peerIds } },
      select: { id: true, name: true, role: true, email: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const data = peerIds.map((peerId) => ({
      peer: userMap.get(peerId) || { id: peerId, name: "Unknown" },
      lastMessage: peers.get(peerId),
      unreadCount: rows.filter(
        (m) => m.senderId === peerId && m.recipientId === userId && !m.readAt,
      ).length,
    }))

    return res.json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/messages/contacts
export const listMessageContacts = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const visibleIds = await getVisibleUserIds(userId)
    const ids = visibleIds.filter((id) => id !== userId)
    const data = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        degreeProgram: true,
      },
      orderBy: { name: "asc" },
    })

    return res.json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}
