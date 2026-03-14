import { prisma } from "../utils/prisma.js"
import { getUserBasic } from "../utils/relationship.js"

// Blog select for consistent response
const blogSelect = {
  id: true,
  groupId: true,
  tutorId: true,
  studentId: true,
  title: true,
  content: true,
  sorting: true,
  createdAt: true,
  createdBy: true,
  tutor: { select: { id: true, name: true, email: true } },
  student: { select: { id: true, name: true, email: true } },
}

// Comment select
const commentSelect = {
  id: true,
  commentText: true,
  createdAt: true,
  commenterId: true,
  commenter: { select: { id: true, name: true, role: true } },
}

// POST /api/blogs - Create blog (tutor only)
export const createBlog = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const { title, content, sorting } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    const me = await getUserBasic(userId)
    if (!me || me.role !== "tutor") {
      return res.status(403).json({ error: "Only tutors can create blogs" })
    }

    // Generate groupId to link all copies
    const { randomUUID } = await import("crypto")
    const groupId = randomUUID()

    // Find all students assigned to this tutor
    const allocations = await prisma.allocation.findMany({
      where: { tutorId: userId },
      select: { studentId: true },
    })

    if (allocations.length === 0) {
      return res.status(400).json({ error: "No students assigned to you" })
    }

    // Create master blog post (no studentId)
    const masterBlog = await prisma.blogPost.create({
      data: {
        groupId,
        tutorId: userId,
        studentId: null, // Master post
        title,
        content,
        sorting,
        createdBy: userId,
      },
      select: blogSelect,
    })

    // Create a copy for each assigned student
    const studentBlogs = await Promise.all(
      allocations.map((alloc) =>
        prisma.blogPost.create({
          data: {
            groupId,
            tutorId: userId,
            studentId: alloc.studentId,
            title,
            content,
            sorting,
            createdBy: userId,
          },
          select: blogSelect,
        })
      )
    )

    return res.status(201).json({
      data: {
        master: masterBlog,
        copies: studentBlogs,
        totalStudents: allocations.length,
      },
    })
  } catch (err) {
    console.error("createBlog error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/blogs - List blogs
export const listBlogs = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(userId)
    if (!me) return res.status(404).json({ error: "User not found" })

    let where = {}

    if (me.role === "tutor") {
      // Tutor sees their master posts only (studentId = null)
      where = { tutorId: userId, studentId: null }
    } else if (me.role === "student") {
      // Student sees their copies only
      where = { studentId: userId }
    } else {
      return res.status(403).json({ error: "Invalid role" })
    }

    const blogs = await prisma.blogPost.findMany({
      where,
      select: {
        ...blogSelect,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Format response - add comment count
    const data = blogs.map((blog) => ({
      ...blog,
      commentCount: blog._count.comments,
    }))

    return res.json({ data })
  } catch (err) {
    console.error("listBlogs error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/blogs/group/:groupId - Get all student copies for a group (tutor view)
export const getBlogGroup = async (req, res) => {
  try {
    const userId = req.user?.id
    const { groupId } = req.params

    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(userId)
    if (!me || me.role !== "tutor") {
      return res.status(403).json({ error: "Only tutors can view blog groups" })
    }

    // Get all copies in this group
    const blogs = await prisma.blogPost.findMany({
      where: { groupId, tutorId: userId },
      select: {
        ...blogSelect,
        _count: { select: { comments: true } },
      },
      orderBy: { student: { name: "asc" } },
    })

    if (blogs.length === 0) {
      return res.status(404).json({ error: "Blog group not found" })
    }

    return res.json({ data: blogs })
  } catch (err) {
    console.error("getBlogGroup error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/blogs/:id - Get single blog with comments
export const getBlog = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(userId)
    if (!me) return res.status(404).json({ error: "User not found" })

    const blog = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        ...blogSelect,
        comments: {
          select: commentSelect,
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Check access: either tutor owns it or student is the target
    const hasAccess =
      (me.role === "tutor" && blog.tutorId === userId) ||
      (me.role === "student" && blog.studentId === userId)

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" })
    }

    return res.json({ data: blog })
  } catch (err) {
    console.error("getBlog error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// PUT /api/blogs/:id - Update blog (tutor only, updates all copies in group)
export const updateBlog = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { title, content, sorting } = req.body

    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(userId)
    if (!me || me.role !== "tutor") {
      return res.status(403).json({ error: "Only tutors can update blogs" })
    }

    // Find the blog to get groupId
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
      select: { groupId: true, tutorId: true },
    })

    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    if (existingBlog.tutorId !== userId) {
      return res.status(403).json({ error: "Not your blog" })
    }

    // Update all blogs in the group
    await prisma.blogPost.updateMany({
      where: { groupId: existingBlog.groupId },
      data: { title, content, sorting },
    })

    // Return updated master blog
    const updatedMaster = await prisma.blogPost.findFirst({
      where: { groupId: existingBlog.groupId, studentId: null },
      select: blogSelect,
    })

    return res.json({ data: updatedMaster })
  } catch (err) {
    console.error("updateBlog error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// DELETE /api/blogs/:id - Delete blog (tutor only, deletes all copies)
export const deleteBlog = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(userId)
    if (!me || me.role !== "tutor") {
      return res.status(403).json({ error: "Only tutors can delete blogs" })
    }

    // Find the blog to get groupId
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
      select: { groupId: true, tutorId: true },
    })

    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    if (existingBlog.tutorId !== userId) {
      return res.status(403).json({ error: "Not your blog" })
    }

    // Delete all blogs in the group (cascades to comments)
    await prisma.blogPost.deleteMany({
      where: { groupId: existingBlog.groupId },
    })

    return res.json({ message: "Blog deleted successfully" })
  } catch (err) {
    console.error("deleteBlog error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// POST /api/blogs/:id/comments - Add comment to blog
export const addComment = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { commentText } = req.body

    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ error: "Comment text is required" })
    }

    const me = await getUserBasic(userId)
    if (!me) return res.status(404).json({ error: "User not found" })

    // Check blog exists and user has access
    const blog = await prisma.blogPost.findUnique({
      where: { id },
      select: { tutorId: true, studentId: true },
    })

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Check access
    const hasAccess =
      (me.role === "tutor" && blog.tutorId === userId) ||
      (me.role === "student" && blog.studentId === userId)

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        blogId: id,
        commenterId: userId,
        commentText: commentText.trim(),
      },
      select: commentSelect,
    })

    return res.status(201).json({ data: comment })
  } catch (err) {
    console.error("addComment error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/blogs/:id/comments - Get comments for a blog
export const getComments = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(userId)
    if (!me) return res.status(404).json({ error: "User not found" })

    const blog = await prisma.blogPost.findUnique({
      where: { id },
      select: { tutorId: true, studentId: true },
    })

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Check access
    const hasAccess =
      (me.role === "tutor" && blog.tutorId === userId) ||
      (me.role === "student" && blog.studentId === userId)

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" })
    }

    const comments = await prisma.comment.findMany({
      where: { blogId: id },
      select: commentSelect,
      orderBy: { createdAt: "asc" },
    })

    return res.json({ data: comments })
  } catch (err) {
    console.error("getComments error:", err)
    return res.status(500).json({ error: "Internal server error" })
  }
}
