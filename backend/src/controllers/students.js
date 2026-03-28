import { prisma } from "../utils/prisma.js";
import { hashPassword } from "../utils/auth.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const studentSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  degreeProgram: true,
  isActive: true,
  createdAt: true,
};

// GET /api/students?page=1&limit=10&search=
export const listStudents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search?.trim() || "";

    const where = {
      role: "student",
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: studentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/students/unassigned?page=1&limit=10&search=
export const listUnassignedStudents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search?.trim() || "";

    const where = {
      role: "student",
      isActive: true,
      studentAllocations: {
        none: {},
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: studentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/students/assigned?page=1&limit=10&search=
export const listAssignedStudents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search?.trim() || "";

    const where = {
      role: "student",
      isActive: true,
      studentAllocations: {
        some: {},
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          degreeProgram: true,
          isActive: true,
          createdAt: true,
          studentAllocations: {
            select: {
              id: true,
              tutorId: true,
              allocatedAt: true,
              tutor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  department: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Format the response to flatten allocation data
    const formattedData = data.map((student) => ({
      ...student,
      allocation: student.studentAllocations[0] || null,
      studentAllocations: undefined,
    }));

    res.json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/students/:id
export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" });
    }

    const student = await prisma.user.findFirst({
      where: { id, role: "student" },
      select: {
        ...studentSelect,
        studentAllocations: {
          select: {
            id: true,
            tutorId: true,
            allocatedAt: true,
            tutor: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Format response with allocation data
    const formattedStudent = {
      ...student,
      allocation: student.studentAllocations[0] || null,
      studentAllocations: undefined,
    };

    res.json({ data: formattedStudent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/students
export const createStudent = async (req, res) => {
  try {
    const { email, name, degreeProgram } = req.body;
    const errors = [];

    if (!email) errors.push("Email is required");
    else if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format");

    if (!name) errors.push("Name is required");

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const student = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("123456"),
        name,
        role: "student",
        degreeProgram: degreeProgram || null,
      },
      select: studentSelect,
    });

    res.status(201).json({ data: student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" });
    }

    const { email, name, degreeProgram } = req.body;
    const errors = [];
    const data = {};

    if (email !== undefined) {
      if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format");
      else data.email = email;
    }

    if (name !== undefined) data.name = name;

    if (degreeProgram !== undefined) data.degreeProgram = degreeProgram;

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }

    // Check student exists
    const existing = await prisma.user.findFirst({
      where: { id, role: "student" },
    });
    if (!existing) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check email uniqueness if changing email
    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    const student = await prisma.user.update({
      where: { id },
      data,
      select: studentSelect,
    });

    res.json({ data: student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/students/:id (soft delete)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" });
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "student" },
    });
    if (!existing) {
      return res.status(404).json({ error: "Student not found" });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: "Student deactivated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/students/me/dashboard - Get student dashboard data
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ error: "Unauthorized" });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const now = new Date();

    const [profile, allocation] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { degreeProgram: true },
      }),
      prisma.allocation.findUnique({
        where: { studentId },
        select: {
          tutor: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
        },
      }),
    ]);

    const [
      nextMeeting,
      recentDocuments,
      recentBlogPosts,
      unreadMessages,
      messagesLast7Days,
      upcomingMeetingsCount,
    ] = await Promise.all([
      prisma.meeting.findFirst({
        where: {
          studentId,
          meetingStatus: "scheduled",
          scheduledDate: { gte: now },
        },
        select: {
          id: true,
          scheduledDate: true,
          location: true,
          meetingType: true,
          meetingLink: true,
          meetingName: true,
        },
        orderBy: { scheduledDate: "asc" },
      }),
      prisma.document.findMany({
        // Match student Documents page: only this student's uploads (not tutor's).
        where: { uploaderId: studentId },
        select: {
          id: true,
          fileName: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: "desc" },
        take: 5,
      }),
      prisma.blogPost.findMany({
        // Only posts explicitly tied to this student, not all of the tutor's blogs.
        where: { studentId },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.message.count({
        where: { recipientId: studentId, readAt: null },
      }),
      prisma.message.count({
        where: {
          OR: [{ senderId: studentId }, { recipientId: studentId }],
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.meeting.count({
        where: {
          studentId,
          meetingStatus: "scheduled",
          scheduledDate: { gte: now },
        },
      }),
    ]);

    res.json({
      data: {
        degreeProgram: profile?.degreeProgram ?? null,
        summary: {
          unreadMessages,
          messagesLast7Days,
          upcomingMeetingsCount,
        },
        nextMeeting: nextMeeting
          ? {
              id: nextMeeting.id,
              scheduledAt: nextMeeting.scheduledDate.toISOString(),
              title: nextMeeting.meetingName || null,
              location: nextMeeting.location,
              meetingLink: nextMeeting.meetingLink,
              meetingType: nextMeeting.meetingType,
            }
          : null,
        assignedTutor: allocation
          ? {
              id: allocation.tutor.id,
              name: allocation.tutor.name,
              department: allocation.tutor.department,
            }
          : null,
        recentDocuments: recentDocuments.map((doc) => ({
          id: doc.id,
          label: doc.fileName || "Document",
        })),
        recentBlogPosts: recentBlogPosts.map((post) => ({
          id: post.id,
          title: post.title || "Untitled",
          createdAt: post.createdAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
