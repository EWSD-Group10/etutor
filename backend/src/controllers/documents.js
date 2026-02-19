import { prisma } from "../utils/prisma.js"
import { canDirectInteract, getUserBasic, getVisibleUserIds } from "../utils/relationship.js"

const docSelect = {
  id: true,
  title: true,
  fileName: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  createdAt: true,
  uploader: { select: { id: true, name: true, role: true, email: true } },
}

const docCommentSelect = {
  id: true,
  content: true,
  parentId: true,
  createdAt: true,
  author: { select: { id: true, name: true, role: true } },
}

export const listDocuments = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const visibleUserIds = await getVisibleUserIds(userId)
    const q = req.query.q?.trim() || ""

    const data = await prisma.document.findMany({
      where: {
        uploaderId: { in: visibleUserIds },
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { fileName: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: docSelect,
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    return res.json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const createDocument = async (req, res) => {
  try {
    const userId = req.user?.id
    const { title, fileName, fileUrl, fileType = null, fileSize = null } = req.body
    if (!userId || !title?.trim() || !fileName?.trim()) {
      return res.status(400).json({ error: "title and fileName are required" })
    }

    const me = await getUserBasic(userId)
    if (!me || (me.role !== "student" && me.role !== "tutor")) {
      return res.status(403).json({ error: "Only students and tutors can upload documents" })
    }

    const normalizedFileName = fileName.trim()
    const normalizedUrl = fileUrl?.trim() || `local://${normalizedFileName}`
    const data = await prisma.document.create({
      data: {
        uploaderId: userId,
        title: title.trim(),
        fileName: normalizedFileName,
        fileUrl: normalizedUrl,
        fileType,
        fileSize,
      },
      select: docSelect,
    })
    return res.status(201).json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const getDocument = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const doc = await prisma.document.findUnique({
      where: { id },
      select: { ...docSelect, uploaderId: true },
    })
    if (!doc) return res.status(404).json({ error: "Document not found" })

    const visibleUserIds = await getVisibleUserIds(userId)
    if (!visibleUserIds.includes(doc.uploaderId)) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const comments = await prisma.documentComment.findMany({
      where: { documentId: id },
      select: docCommentSelect,
      orderBy: { createdAt: "asc" },
    })
    return res.json({ data: doc, comments })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const addDocumentComment = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { content, parentId = null } = req.body
    if (!userId || !content?.trim()) {
      return res.status(400).json({ error: "content is required" })
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      select: { id: true, uploaderId: true },
    })
    if (!doc) return res.status(404).json({ error: "Document not found" })

    const allowed = await canDirectInteract(userId, doc.uploaderId)
    if (!allowed && userId !== doc.uploaderId) {
      return res.status(403).json({ error: "Commenting allowed only within relationship scope" })
    }

    if (parentId) {
      const parent = await prisma.documentComment.findUnique({
        where: { id: parentId },
        select: { documentId: true },
      })
      if (!parent || parent.documentId !== id) {
        return res.status(400).json({ error: "Invalid parent comment" })
      }
    }

    const data = await prisma.documentComment.create({
      data: {
        documentId: id,
        authorId: userId,
        parentId,
        content: content.trim(),
      },
      select: docCommentSelect,
    })

    return res.status(201).json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}
