import { prisma } from "../utils/prisma.js";
import { buildStudentDashboardPayload } from "./students.js";
import { buildTutorDashboardPayload } from "./teachers.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function startOfUtcDay(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

// GET /api/admin/dashboard - Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({
      where: { role: "student" },
    });

    const activeTutors = await prisma.user.count({
      where: { role: "tutor", isActive: true },
    });

    const today = startOfUtcDay(new Date());
    const windowStart = new Date(today);
    windowStart.setUTCDate(windowStart.getUTCDate() - 42);

    const meetingsInWindow = await prisma.meeting.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { createdAt: true, studentId: true },
    });

    const meetingsLast6Weeks = meetingsInWindow.length;

    const meetingCountByStudent = new Map();
    for (const m of meetingsInWindow) {
      meetingCountByStudent.set(
        m.studentId,
        (meetingCountByStudent.get(m.studentId) || 0) + 1,
      );
    }

    const allAllocations = await prisma.allocation.findMany({
      include: {
        student: {
          select: { id: true, name: true, degreeProgram: true },
        },
        tutor: {
          select: { id: true, name: true },
        },
      },
    });

    const seenStudent = new Set();
    const atRiskStudents = [];
    for (const allocation of allAllocations) {
      const sid = allocation.student.id;
      if (seenStudent.has(sid)) continue;
      seenStudent.add(sid);

      const n = meetingCountByStudent.get(sid) ?? 0;
      if (n === 0) {
        atRiskStudents.push({
          id: sid,
          name: allocation.student.name,
          course: allocation.student.degreeProgram || "Unknown",
          tutorName: allocation.tutor.name,
          meetingsInLast6Weeks: 0,
          status: "No meetings (6 wks)",
        });
      }
    }

    const topAtRiskStudents = atRiskStudents
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10);

    // Six contiguous 7-day buckets ending today (UTC); value = meetings created in bucket
    const weeklyMeetings = [];
    for (let idx = 5; idx >= 0; idx--) {
      const weekEnd = new Date(today);
      weekEnd.setUTCDate(weekEnd.getUTCDate() - idx * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setUTCDate(weekStart.getUTCDate() - 7);

      const count = meetingsInWindow.filter(
        (m) => m.createdAt >= weekStart && m.createdAt < weekEnd,
      ).length;

      weeklyMeetings.push({
        week: `Wk ${6 - idx}`,
        count,
      });
    }

    const students = await prisma.user.findMany({
      where: { role: "student" },
      select: { degreeProgram: true },
    });

    const distribution = {};
    students.forEach((student) => {
      const subject = student.degreeProgram || "Other";
      distribution[subject] = (distribution[subject] || 0) + 1;
    });

    const distributionData = Object.entries(distribution)
      .map(([subject, count]) => ({
        subject: subject.substring(0, 4),
        students: count,
      }))
      .slice(0, 4);

    res.json({
      data: {
        statCards: [
          { label: "Total Students", value: totalStudents.toString() },
          { label: "Active Tutors", value: activeTutors.toString() },
          {
            label: "Students — no meetings (6 wks)",
            value: atRiskStudents.length.toString(),
          },
          {
            label: "Meetings created (6 wks)",
            value: meetingsLast6Weeks.toString(),
          },
        ],
        weeklyMeetings,
        distributionData,
        atRiskStudents: topAtRiskStudents,
        atRiskDefinition:
          "Assigned students with zero meetings recorded in the last 6 weeks (UTC).",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/reports/most-active-users?days=7|30&limit=10
export const getMostActiveUsers = async (req, res) => {
  try {
    const rawDays = parseInt(String(req.query.days || "7"), 10);
    const windowDays = rawDays === 30 ? 30 : 7;
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limit || "10"), 10) || 10),
    );

    const since = new Date();
    since.setDate(since.getDate() - windowDays);
    since.setHours(0, 0, 0, 0);

    const activity = prisma.userActivityEvent;
    if (!activity || typeof activity.groupBy !== "function") {
      return res.json({
        data: {
          windowDays,
          limit,
          since: since.toISOString(),
          topUsers: [],
        },
      });
    }

    const grouped = await activity.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    const userIds = grouped.map((g) => g.userId);
    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, role: true },
          })
        : [];

    const byId = new Map(users.map((u) => [u.id, u]));

    const topUsers = grouped.map((g) => {
      const u = byId.get(g.userId);
      return {
        userId: g.userId,
        eventCount: g._count.id,
        name: u?.name ?? null,
        email: u?.email ?? "",
        role: u?.role ?? null,
      };
    });

    res.json({
      data: {
        windowDays,
        limit,
        since: since.toISOString(),
        topUsers,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/view-as/student/:userId/dashboard — same payload as student /me/dashboard + viewAs meta
export const getAdminViewAsStudentDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!UUID_REGEX.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const target = await prisma.user.findFirst({
      where: { id: userId, role: "student" },
      select: { id: true, name: true, email: true, isActive: true },
    });
    if (!target) {
      return res.status(404).json({ error: "Student not found" });
    }

    const dashboard = await buildStudentDashboardPayload(userId);
    res.json({
      data: {
        ...dashboard,
        viewAs: {
          userId: target.id,
          name: target.name,
          email: target.email,
          role: "student",
          isActive: target.isActive,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/view-as/tutor/:userId/dashboard — same payload as tutor /me/dashboard + viewAs meta
export const getAdminViewAsTutorDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!UUID_REGEX.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const target = await prisma.user.findFirst({
      where: { id: userId, role: "tutor" },
      select: { id: true, name: true, email: true, isActive: true },
    });
    if (!target) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    const dashboard = await buildTutorDashboardPayload(userId);
    res.json({
      data: {
        ...dashboard,
        viewAs: {
          userId: target.id,
          name: target.name,
          email: target.email,
          role: "tutor",
          isActive: target.isActive,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
