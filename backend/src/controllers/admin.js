import { prisma } from "../utils/prisma.js";

// GET /api/admin/dashboard - Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    // Get total students count
    const totalStudents = await prisma.user.count({
      where: { role: "student" },
    });

    // Get active tutors count
    const activeTutors = await prisma.user.count({
      where: { role: "tutor", isActive: true },
    });

    // Get at-risk students (low engagement)
    // For now, we'll consider students with engagement < 40% as at-risk
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

    // Calculate engagement for each student (mock based on meeting count)
    const atRiskStudents = [];
    for (const allocation of allAllocations) {
      const meetings = await prisma.meeting.count({
        where: { studentId: allocation.student.id },
      });
      const engagement = Math.min(meetings * 15, 100); // Mock: engagement based on meeting count

      if (engagement < 40) {
        atRiskStudents.push({
          id: allocation.student.id,
          name: allocation.student.name,
          course: allocation.student.degreeProgram || "Unknown",
          engagement: Math.round(engagement),
          risk: "High",
          tutorName: allocation.tutor.name,
        });
      }
    }

    // Sort by engagement (lowest first) and take top 10
    const topAtRiskStudents = atRiskStudents
      .sort((a, b) => a.engagement - b.engagement)
      .slice(0, 10);

    // Get engagement trend (last 6 weeks)
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const meetingsTrend = await prisma.meeting.findMany({
      where: {
        createdAt: {
          gte: sixWeeksAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group meetings by week
    const engagementData = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekMeetings = meetingsTrend.filter(
        (m) => m.createdAt >= weekStart && m.createdAt < weekEnd,
      );

      // Calculate engagement as percentage (mock: based on meeting count)
      const engagement = Math.min(weekMeetings.length * 10, 100);

      engagementData.push({
        week: `Week ${6 - i}`,
        value: engagement,
      });
    }

    // Get student distribution by degree program
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
        subject: subject.substring(0, 4), // Abbreviate for display
        students: count,
      }))
      .slice(0, 4); // Top 4 subjects

    // Calculate various metrics
    const totalMeetings = await prisma.meeting.count();
    const avgEngagement = Math.round(
      engagementData.reduce((sum, item) => sum + item.value, 0) /
        engagementData.length || 0,
    );

    // Return dashboard data
    res.json({
      data: {
        statCards: [
          {
            label: "Total Students",
            value: totalStudents.toString(),
          },
          {
            label: "Active Tutors",
            value: activeTutors.toString(),
          },
          {
            label: "At-Risk Students",
            value: topAtRiskStudents.length.toString(),
          },
          {
            label: "Avg Engagement",
            value: `${avgEngagement}%`,
          },
        ],
        engagementData,
        distributionData,
        atRiskStudents: topAtRiskStudents,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
