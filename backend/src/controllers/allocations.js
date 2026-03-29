import { prisma } from "../utils/prisma.js";
import {
  notifyStudentTutorAssigned,
  notifyStudentTutorReallocated,
} from "../emails/studentAllocation.js";
import { createNotification } from "./notifications.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const allocationSelect = {
  id: true,
  allocatedAt: true,
  reallocatedBy: true,
  reason: true,
  notes: true,
  student: {
    select: { id: true, name: true, email: true, degreeProgram: true },
  },
  tutor: {
    select: { id: true, name: true, email: true, department: true },
  },
};

// Format allocation response to match frontend expectations
const formatAllocation = (allocation) => ({
  id: allocation.id,
  studentId: allocation.student.id,
  studentName: allocation.student.name,
  studentEmail: allocation.student.email,
  tutorId: allocation.tutor.id,
  tutorName: allocation.tutor.name,
  tutorEmail: allocation.tutor.email,
  reason: allocation.reason,
  notes: allocation.notes,
  allocatedAt: allocation.allocatedAt,
});

// Validate a UUID and return an error string if invalid, null otherwise
const validateUUID = (value, label) => {
  if (!value) return `${label} is required`;
  if (!UUID_REGEX.test(value)) return `Invalid ${label} format`;
  return null;
};

// GET /api/allocations?page=1&limit=10&search=&status=all|assigned|unassigned
export const listAllocations = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search?.trim() || "";
    const status = req.query.status || "all"; // "all", "assigned", or "unassigned"

    let where = {};
    let studentSelectOverride = null;

    if (status === "unassigned") {
      // Unassigned students - students without allocations
      where = {
        role: "student",
        isActive: true,
        studentAllocations: { none: {} },
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      // Query from User table instead of Allocation
      const [students, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            degreeProgram: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      // Format unassigned students as allocations with null tutor
      const data = students.map((student) => ({
        id: student.id, // Use student ID as allocation ID for this view
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentDegreeProgram: student.degreeProgram,
        tutorId: null,
        tutorName: null,
        tutorEmail: null,
        reason: null,
        notes: null,
        allocatedAt: null,
      }));

      return res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // For "all" and "assigned", query from Allocation table
    where = search
      ? {
          OR: [
            { student: { name: { contains: search, mode: "insensitive" } } },
            { student: { email: { contains: search, mode: "insensitive" } } },
            { tutor: { name: { contains: search, mode: "insensitive" } } },
            { tutor: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.allocation.findMany({
        where,
        select: allocationSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { allocatedAt: "desc" },
      }),
      prisma.allocation.count({ where }),
    ]);

    res.json({
      data: data.map(formatAllocation),
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

// GET /api/allocations/:id
export const getAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid allocation ID format" });
    }

    const allocation = await prisma.allocation.findUnique({
      where: { id },
      select: allocationSelect,
    });

    if (!allocation) {
      return res.status(404).json({ error: "Allocation not found" });
    }

    res.json({ data: formatAllocation(allocation) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/allocations
// Creates or updates (reallocates) a single student → tutor assignment.
// studentId is unique — upsert updates the tutor when student is already allocated.
export const createAllocation = async (req, res) => {
  try {
    const { tutorId, studentId, reason, notes } = req.body;
    const errors = [];

    const tutorIdErr = validateUUID(tutorId, "tutorId");
    if (tutorIdErr) errors.push(tutorIdErr);

    const studentIdErr = validateUUID(studentId, "studentId");
    if (studentIdErr) errors.push(studentIdErr);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Verify tutor exists
    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, role: "tutor" },
    });
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    // Verify student exists
    const student = await prisma.user.findFirst({
      where: { id: studentId, role: "student" },
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const prior = await prisma.allocation.findUnique({
      where: { studentId },
      select: {
        tutorId: true,
        tutor: { select: { name: true, email: true } },
      },
    });

    const allocation = await prisma.allocation.upsert({
      where: { studentId },
      create: {
        tutorId,
        studentId,
        reason: reason || null,
        notes: notes || null,
      },
      update: {
        tutorId,
        reallocatedBy: req.user.id,
        reason: reason || null,
        notes: notes || null,
        allocatedAt: new Date(),
      },
      select: allocationSelect,
    });

    if (!prior) {
      notifyStudentTutorAssigned(
        allocation.student.email,
        allocation.student.name,
        allocation.tutor.name,
      );
      createNotification({
        userId: allocation.student.id,
        type: "tutor_assigned",
        title: "Tutor Assigned",
        message: `You have been assigned to ${allocation.tutor.name} for academic support.`,
        metadata: { tutorId: allocation.tutor.id, tutorName: allocation.tutor.name },
      });
      createNotification({
        userId: allocation.tutor.id,
        type: "student_assigned",
        title: "Student Assigned",
        message: `${allocation.student.name} has been assigned to you for academic support.`,
        metadata: { studentId: allocation.student.id, studentName: allocation.student.name },
      });
    } else if (prior.tutorId !== tutorId) {
      notifyStudentTutorReallocated(
        allocation.student.email,
        allocation.student.name,
        allocation.tutor.name,
        prior.tutor?.name,
      );
      createNotification({
        userId: allocation.student.id,
        type: "tutor_reallocated",
        title: "Tutor Reallocated",
        message: `Your tutor has been changed from ${prior.tutor?.name} to ${allocation.tutor.name}.`,
        metadata: { tutorId: allocation.tutor.id, tutorName: allocation.tutor.name, previousTutorName: prior.tutor?.name },
      });
      createNotification({
        userId: allocation.tutor.id,
        type: "student_assigned",
        title: "Student Assigned",
        message: `${allocation.student.name} has been assigned to you for academic support.`,
        metadata: { studentId: allocation.student.id, studentName: allocation.student.name },
      });
    }

    res.status(201).json({ data: formatAllocation(allocation) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/allocations/bulk
// Assigns one tutor to multiple students by looping through each studentId.
// Each student is processed individually with prisma.allocation.create/upsert.
export const bulkCreateAllocations = async (req, res) => {
  try {
    const { tutorId, studentIds, reason, notes } = req.body;
    const errors = [];

    const tutorIdErr = validateUUID(tutorId, "tutorId");
    if (tutorIdErr) errors.push(tutorIdErr);

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      errors.push("studentIds must be a non-empty array");
    } else {
      studentIds.forEach((id, i) => {
        if (!UUID_REGEX.test(id))
          errors.push(`studentIds[${i}]: invalid UUID format`);
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Verify tutor exists
    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, role: "tutor" },
    });
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    // Verify all students exist upfront
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds }, role: "student" },
      select: { id: true },
    });
    const validStudentIds = new Set(students.map((s) => s.id));
    const invalidStudentIds = studentIds.filter(
      (id) => !validStudentIds.has(id),
    );
    if (invalidStudentIds.length > 0) {
      return res.status(404).json({
        error: "Some students not found",
        invalidStudentIds,
      });
    }

    const priors = await prisma.allocation.findMany({
      where: { studentId: { in: studentIds } },
      select: {
        studentId: true,
        tutorId: true,
        tutor: { select: { name: true, email: true } },
      },
    });
    const priorByStudentId = new Map(priors.map((p) => [p.studentId, p]));

    // Loop through each studentId and upsert individually
    const results = [];
    for (const studentId of studentIds) {
      const prior = priorByStudentId.get(studentId);

      const allocation = await prisma.allocation.upsert({
        where: { studentId },
        create: {
          tutorId,
          studentId,
          reason: reason || null,
          notes: notes || null,
        },
        update: {
          tutorId,
          reallocatedBy: req.user.id,
          reason: reason || null,
          notes: notes || null,
          allocatedAt: new Date(),
        },
        select: allocationSelect,
      });

      if (!prior) {
        notifyStudentTutorAssigned(
          allocation.student.email,
          allocation.student.name,
          allocation.tutor.name,
        );
        createNotification({
          userId: allocation.student.id,
          type: "tutor_assigned",
          title: "Tutor Assigned",
          message: `You have been assigned to ${allocation.tutor.name} for academic support.`,
          metadata: { tutorId: allocation.tutor.id, tutorName: allocation.tutor.name },
        });
        createNotification({
          userId: allocation.tutor.id,
          type: "student_assigned",
          title: "Student Assigned",
          message: `${allocation.student.name} has been assigned to you for academic support.`,
          metadata: { studentId: allocation.student.id, studentName: allocation.student.name },
        });
      } else if (prior.tutorId !== tutorId) {
        notifyStudentTutorReallocated(
          allocation.student.email,
          allocation.student.name,
          allocation.tutor.name,
          prior.tutor?.name,
        );
        createNotification({
          userId: allocation.student.id,
          type: "tutor_reallocated",
          title: "Tutor Reallocated",
          message: `Your tutor has been changed from ${prior.tutor?.name} to ${allocation.tutor.name}.`,
          metadata: { tutorId: allocation.tutor.id, tutorName: allocation.tutor.name, previousTutorName: prior.tutor?.name },
        });
        createNotification({
          userId: allocation.tutor.id,
          type: "student_assigned",
          title: "Student Assigned",
          message: `${allocation.student.name} has been assigned to you for academic support.`,
          metadata: { studentId: allocation.student.id, studentName: allocation.student.name },
        });
      }

      results.push(formatAllocation(allocation));
    }

    res.status(201).json({
      data: results,
      summary: { total: results.length },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/allocations/:id
export const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid allocation ID format" });
    }

    const { tutorId, reason, notes } = req.body;
    const errors = [];
    const data = {};

    if (tutorId !== undefined) {
      if (!UUID_REGEX.test(tutorId)) errors.push("Invalid tutorId format");
      else {
        data.tutorId = tutorId;
        data.reallocatedBy = req.user.id;
      }
    }

    if (reason !== undefined) data.reason = reason;
    if (notes !== undefined) data.notes = notes;

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }

    const existing = await prisma.allocation.findUnique({
      where: { id },
      select: {
        tutorId: true,
        student: {
          select: { email: true, name: true },
        },
        tutor: { select: { name: true, email: true } },
      },
    });
    if (!existing) {
      return res.status(404).json({ error: "Allocation not found" });
    }

    // Verify new tutor exists if tutorId is changing
    if (data.tutorId && data.tutorId !== existing.tutorId) {
      const tutor = await prisma.user.findFirst({
        where: { id: data.tutorId, role: "tutor" },
      });
      if (!tutor) {
        return res.status(404).json({ error: "Tutor not found" });
      }
    }

    const allocation = await prisma.allocation.update({
      where: { id },
      data,
      select: allocationSelect,
    });

    if (data.tutorId && data.tutorId !== existing.tutorId) {
      notifyPartiesAfterAllocationUpsert(
        {
          tutorId: existing.tutorId,
          tutor: existing.tutor,
        },
        allocation,
      );
      createNotification({
        userId: allocation.student.id,
        type: "tutor_reallocated",
        title: "Tutor Reallocated",
        message: `Your tutor has been changed from ${existing.tutor?.name} to ${allocation.tutor.name}.`,
        metadata: { tutorId: allocation.tutor.id, tutorName: allocation.tutor.name, previousTutorName: existing.tutor?.name },
      });
      createNotification({
        userId: allocation.tutor.id,
        type: "student_assigned",
        title: "Student Assigned",
        message: `${allocation.student.name} has been assigned to you for academic support.`,
        metadata: { studentId: allocation.student.id, studentName: allocation.student.name },
      });
    }

    res.json({ data: formatAllocation(allocation) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/allocations/:id
export const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid allocation ID format" });
    }

    const existing = await prisma.allocation.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Allocation not found" });
    }

    await prisma.allocation.delete({ where: { id } });

    res.json({ message: "Allocation removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/allocations/stats
export const getAllocationStats = async (req, res) => {
  try {
    // Total allocations
    const totalAllocations = await prisma.allocation.count();

    // Total students
    const totalStudents = await prisma.user.count({
      where: { role: "student", isActive: true },
    });

    // Unassigned students (students without any allocation)
    const unassignedStudents = await prisma.user.count({
      where: {
        role: "student",
        isActive: true,
        studentAllocations: {
          none: {},
        },
      },
    });

    // Active tutors (tutors with at least one allocation)
    const activeTutorsData = await prisma.allocation.groupBy({
      by: ["tutorId"],
    });
    const activeTutors = activeTutorsData.length;

    // Average students per tutor
    const avgStudentsPerTutor =
      activeTutors > 0
        ? Math.round((totalAllocations / activeTutors) * 100) / 100
        : 0;

    res.json({
      totalAllocations,
      unassignedStudents,
      activeTutors,
      avgStudentsPerTutor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
