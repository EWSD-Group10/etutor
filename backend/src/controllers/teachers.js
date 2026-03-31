import { prisma } from "../utils/prisma.js";
import { hashPassword } from "../utils/auth.js";
import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createTutorSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  degreeProgram: z.string().optional().nullable(),
  department: z.string().min(1),
});

const updateTutorSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  degreeProgram: z.string().optional().nullable(),
  department: z.string().min(1).optional(),
});

const teacherSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  degreeProgram: true,
  department: true,
  isActive: true,
  createdAt: true,
};

// GET /api/tutors?page=1&limit=10&search=
export const listTutors = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search?.trim() || "";

    const where = {
      role: "tutor",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const tutors = await prisma.user.findMany({
      where,
      select: { ...teacherSelect, tutorAllocations: { select: { id: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Transform data to include student count
    const data = tutors.map((tutor) => {
      const { tutorAllocations, ...tutelemetry } = tutor;
      return {
        ...tutelemetry,
        studentCount: tutorAllocations.length,
        maxStudents: 15, // You can make this configurable
      };
    });

    const total = await prisma.user.count({ where });

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

// GET /api/tutors/me/students - list students allocated to current tutor (for scheduling meetings)
export const listMyStudents = async (req, res) => {
  try {
    const tutorId = req.user?.id;
    if (!tutorId) return res.status(401).json({ error: "Unauthorized" });

    const allocations = await prisma.allocation.findMany({
      where: { tutorId },
      select: {
        allocatedAt: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            degreeProgram: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { allocatedAt: "desc" },
    });

    const studentIds = allocations.map((a) => a.student.id);

    const unreadRows =
      studentIds.length > 0
        ? await prisma.message.findMany({
          where: {
            recipientId: tutorId,
            readAt: null,
            senderId: { in: studentIds },
          },
          select: { senderId: true },
        })
        : [];

    const unreadFromStudentById = new Map();
    for (const row of unreadRows) {
      const sid = row.senderId;
      unreadFromStudentById.set(sid, (unreadFromStudentById.get(sid) || 0) + 1);
    }

    const data = allocations.map((a) => ({
      ...a.student,
      allocatedAt: a.allocatedAt.toISOString(),
      unreadFromStudent: unreadFromStudentById.get(a.student.id) || 0,
    }));

    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/tutors/:id
export const getTutor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid teacher ID format" });
    }

    const teacher = await prisma.user.findFirst({
      where: { id, role: "tutor" },
      select: teacherSelect,
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ data: teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/tutors
export const createTutor = async (req, res) => {
  try {
    const parseResult = createTutorSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.issues });
    }

    const { email, name, degreeProgram, department } = parseResult.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const teacher = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("123456"),
        name,
        role: "tutor",
        degreeProgram,
        department,
      },
      select: teacherSelect,
    });

    res.status(201).json({ data: teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/tutors/:id
export const updateTutor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid teacher ID format" });
    }

    const parseResult = updateTutorSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.issues });
    }

    const { email, name, degreeProgram, department } = parseResult.data;
    const data = {};

    if (email !== undefined) {
      data.email = email;
    }

    if (name !== undefined) data.name = name;
    if (degreeProgram !== undefined) data.degreeProgram = degreeProgram;
    if (department !== undefined) data.department = department;

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "tutor" },
    });
    if (!existing) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    const teacher = await prisma.user.update({
      where: { id },
      data,
      select: teacherSelect,
    });

    res.json({ data: teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/tutors/:id (soft delete)
export const deleteTutors = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid teacher ID format" });
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "tutor" },
    });
    if (!existing) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: "Teacher deactivated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Build tutor dashboard payload for a given tutor user id (shared: /me + admin view-as).
 * @param {string} tutorId
 */
export async function buildTutorDashboardPayload(tutorId) {
  const now = new Date();

  const allocations = await prisma.allocation.findMany({
    where: { tutorId },
    select: {
      allocatedAt: true,
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          degreeProgram: true,
        },
      },
    },
    orderBy: { allocatedAt: "desc" },
  });

  const studentIds = allocations.map((a) => a.student.id);

  const unreadRows =
    studentIds.length > 0
      ? await prisma.message.findMany({
        where: {
          recipientId: tutorId,
          readAt: null,
          senderId: { in: studentIds },
        },
        select: { senderId: true },
      })
      : [];

  const unreadFromStudentById = new Map();
  for (const row of unreadRows) {
    const sid = row.senderId;
    unreadFromStudentById.set(sid, (unreadFromStudentById.get(sid) || 0) + 1);
  }

  const tuteesWithUnread = studentIds.filter(
    (id) => (unreadFromStudentById.get(id) || 0) > 0,
  ).length;

  const [
    upcomingMeetingsCount,
    upcomingMeetings,
    totalUnreadMessages,
    incomingFromTutees,
  ] = await Promise.all([
    prisma.meeting.count({
      where: {
        tutorId,
        meetingStatus: "scheduled",
        scheduledDate: { gte: now },
      },
    }),
    prisma.meeting.findMany({
      where: {
        tutorId,
        meetingStatus: "scheduled",
        scheduledDate: { gte: now },
      },
      select: {
        id: true,
        scheduledDate: true,
        location: true,
        meetingType: true,
        meetingName: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
      take: 3,
    }),
    prisma.message.count({
      where: {
        recipientId: tutorId,
        readAt: null,
      },
    }),
    studentIds.length > 0
      ? prisma.message.findMany({
        where: {
          recipientId: tutorId,
          senderId: { in: studentIds },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          senderId: true,
          content: true,
          sender: { select: { id: true, name: true } },
        },
      })
      : Promise.resolve([]),
  ]);

  const recentMessages = [];
  const seenSender = new Set();
  for (const m of incomingFromTutees) {
    if (seenSender.has(m.senderId)) continue;
    seenSender.add(m.senderId);
    recentMessages.push({
      id: m.senderId,
      sender: m.sender.name,
      message: m.content,
      unreadCount: unreadFromStudentById.get(m.senderId) || 0,
    });
    if (recentMessages.length >= 2) break;
  }

  return {
    studentsCount: allocations.length,
    tuteesWithUnread,
    upcomingMeetingsCount,
    upcomingMeetings: upcomingMeetings.map((m) => ({
      id: m.id,
      time: m.scheduledDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: m.scheduledDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      location:
        m.meetingType === "virtual"
          ? m.location || "Virtual"
          : m.location || "TBD",
      subject: m.meetingName
        ? `${m.meetingName} · ${m.student.name ?? "Student"}`
        : m.student.name ?? "Student",
    })),
    unreadMessagesCount: totalUnreadMessages,
    recentMessages: recentMessages.slice(0, 2),
    tutees: allocations.map((a) => ({
      id: a.student.id,
      name: a.student.name,
      email: a.student.email,
      degreeProgram: a.student.degreeProgram,
      allocatedAt: a.allocatedAt.toISOString(),
      unreadFromStudent: unreadFromStudentById.get(a.student.id) || 0,
    })),
  };
}

// GET /api/tutors/me/dashboard - Get tutor dashboard data
export const getTutorDashboard = async (req, res) => {
  try {
    const tutorId = req.user?.id;
    if (!tutorId) return res.status(401).json({ error: "Unauthorized" });

    const me = await prisma.user.findUnique({
      where: { id: tutorId },
      select: { role: true },
    });
    if (me?.role !== "tutor") {
      return res.status(403).json({ error: "Tutor access only" });
    }

    const data = await buildTutorDashboardPayload(tutorId);
    res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
