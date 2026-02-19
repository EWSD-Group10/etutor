import { prisma } from "./prisma.js"

export const getUserBasic = async (userId) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true },
  })

export const getStudentTutorPair = async (studentId) =>
  prisma.tutorStudentAssignment.findUnique({
    where: { studentId },
    select: { studentId: true, tutorId: true },
  })

export const hasStudentTutorLink = async (studentId, tutorId) => {
  const row = await prisma.tutorStudentAssignment.findUnique({
    where: { studentId },
    select: { tutorId: true },
  })
  return Boolean(row && row.tutorId === tutorId)
}

export const canDirectInteract = async (userAId, userBId) => {
  if (userAId === userBId) return true

  const [a, b] = await Promise.all([getUserBasic(userAId), getUserBasic(userBId)])
  if (!a || !b) return false
  if (a.role === "admin" || b.role === "admin") return false

  if (a.role === "student" && b.role === "tutor") {
    return hasStudentTutorLink(a.id, b.id)
  }
  if (a.role === "tutor" && b.role === "student") {
    return hasStudentTutorLink(b.id, a.id)
  }
  if (a.role === "student" && b.role === "student") {
    const [aPair, bPair] = await Promise.all([
      getStudentTutorPair(a.id),
      getStudentTutorPair(b.id),
    ])
    return Boolean(aPair && bPair && aPair.tutorId === bPair.tutorId)
  }
  return false
}

export const getVisibleUserIds = async (userId) => {
  const me = await getUserBasic(userId)
  if (!me) return []
  if (me.role === "admin") {
    const users = await prisma.user.findMany({ select: { id: true } })
    return users.map((u) => u.id)
  }
  if (me.role === "student") {
    const pair = await getStudentTutorPair(me.id)
    if (!pair) return [me.id]
    const cohort = await prisma.tutorStudentAssignment.findMany({
      where: { tutorId: pair.tutorId },
      select: { studentId: true },
    })
    return [me.id, pair.tutorId, ...cohort.map((c) => c.studentId)]
  }
  if (me.role === "tutor") {
    const tutees = await prisma.tutorStudentAssignment.findMany({
      where: { tutorId: me.id },
      select: { studentId: true },
    })
    return [me.id, ...tutees.map((t) => t.studentId)]
  }
  return [me.id]
}

