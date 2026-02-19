import { prisma } from "../utils/prisma.js"
import { canDirectInteract, getUserBasic, getVisibleUserIds } from "../utils/relationship.js"

const postSelect = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, role: true, email: true } },
}

const commentSelect = {
  id: true,
  content: true,
  parentId: true,
  createdAt: true,
  author: { select: { id: true, name: true, role: true } },
}

export const listBlogs = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const visibleUserIds = await getVisibleUserIds(userId)
    const q = req.query.q?.trim() || ""

    const data = await prisma.blogPost.findMany({
      where: {
        authorId: { in: visibleUserIds },
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: postSelect,
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    return res.json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const createBlog = async (req, res) => {
  try {
    const userId = req.user?.id
    const { title, content } = req.body
    if (!userId || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "title and content are required" })
    }

    const me = await getUserBasic(userId)
    if (!me || (me.role !== "student" && me.role !== "tutor")) {
      return res.status(403).json({ error: "Only students and tutors can create blogs" })
    }

    const data = await prisma.blogPost.create({
      data: {
        authorId: userId,
        title: title.trim(),
        content: content.trim(),
      },
      select: postSelect,
    })
    return res.status(201).json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const getBlog = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { ...postSelect, authorId: true },
    })
    if (!post) return res.status(404).json({ error: "Blog not found" })

    const visibleUserIds = await getVisibleUserIds(userId)
    if (!visibleUserIds.includes(post.authorId)) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const comments = await prisma.blogComment.findMany({
      where: { postId: id },
      select: commentSelect,
      orderBy: { createdAt: "asc" },
    })

    return res.json({ data: post, comments })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const addBlogComment = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { content, parentId = null } = req.body
    if (!userId || !content?.trim()) {
      return res.status(400).json({ error: "content is required" })
    }

    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })
    if (!post) return res.status(404).json({ error: "Blog not found" })

    const allowed = await canDirectInteract(userId, post.authorId)
    if (!allowed && userId !== post.authorId) {
      return res.status(403).json({ error: "Commenting allowed only within relationship scope" })
    }

    if (parentId) {
      const parent = await prisma.blogComment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      })
      if (!parent || parent.postId !== id) {
        return res.status(400).json({ error: "Invalid parent comment" })
      }
    }

    const data = await prisma.blogComment.create({
      data: {
        postId: id,
        authorId: userId,
        parentId,
        content: content.trim(),
      },
      select: commentSelect,
    })

    return res.status(201).json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

