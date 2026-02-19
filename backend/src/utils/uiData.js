const hashString = (value = "") => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const buildStudentMetrics = (student) => {
  const base = hashString(student.id || student.email || student.name || "")
  const engagement = 8 + (base % 88)
  const year = Number.isInteger(student.yearLevel) ? student.yearLevel : (base % 3) + 1
  const riskLevel = engagement < 35 ? "high" : engagement < 60 ? "at_risk" : "on_track"
  const gpa = Number((2.1 + ((base % 21) / 10)).toFixed(2))
  const attendance = 50 + (base % 50)
  return {
    engagement,
    year,
    riskLevel,
    gpa,
    attendance,
  }
}

export const buildTutorMetrics = (tutor, assignedCount) => {
  const base = hashString(tutor.id || tutor.email || tutor.name || "")
  const maxStudents =
    Number.isInteger(tutor.maxStudents) && tutor.maxStudents > 0
      ? tutor.maxStudents
      : 15 + (base % 6)
  const specialization = tutor.department || tutor.degreeProgram || "Academic Support"
  const status = assignedCount < maxStudents ? "available" : "full"
  return {
    maxStudents,
    specialization,
    status,
  }
}

export const initials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "NA"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
