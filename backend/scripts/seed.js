import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.ts"
import { Pool } from "pg"
import { hashPassword } from "../src/utils/auth.js"
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// -------------------- DATA --------------------

const admins = [
  { email: "admin1@etutor.com", password: "admin123", name: "Alice Admin", department: "IT Services" },
  { email: "admin2@etutor.com", password: "admin123", name: "Bob Admin", department: "Academic Affairs" },
]

const tutors = [
  { email: "tutor1@etutor.com", password: "tutor123", name: "Dr. Sarah Chen", department: "Computer Science" },
  { email: "tutor2@etutor.com", password: "tutor123", name: "Dr. James Wilson", department: "Mathematics" },
  { email: "tutor3@etutor.com", password: "tutor123", name: "Dr. Emily Brown", department: "Computer Science" },
  { email: "tutor4@etutor.com", password: "tutor123", name: "Dr. Michael Lee", department: "Engineering" },
  { email: "tutor5@etutor.com", password: "tutor123", name: "Dr. Olivia Taylor", department: "Data Science" },
]

const students = [
  { email: "student1@etutor.com", password: "student123", name: "Liam Johnson", degreeProgram: "BSc Computer Science" },
  { email: "student2@etutor.com", password: "student123", name: "Emma Williams", degreeProgram: "BSc Computer Science" },
  { email: "student3@etutor.com", password: "student123", name: "Noah Davis", degreeProgram: "BSc Mathematics" },
  { email: "student4@etutor.com", password: "student123", name: "Sophia Martinez", degreeProgram: "BSc Mathematics" },
  { email: "student5@etutor.com", password: "student123", name: "Oliver Garcia", degreeProgram: "BEng Software Engineering" },
  { email: "student6@etutor.com", password: "student123", name: "Ava Rodriguez", degreeProgram: "BEng Software Engineering" },
  { email: "student7@etutor.com", password: "student123", name: "Elijah Hernandez", degreeProgram: "BSc Data Science" },
  { email: "student8@etutor.com", password: "student123", name: "Mia Lopez", degreeProgram: "BSc Data Science" },
  { email: "student9@etutor.com", password: "student123", name: "Lucas Wilson", degreeProgram: "BSc Computer Science" },
  { email: "student10@etutor.com", password: "student123", name: "Charlotte Anderson", degreeProgram: "BSc Computer Science" },
  { email: "student11@etutor.com", password: "student123", name: "Henry Thomas", degreeProgram: "BEng Electrical Engineering" },
  { email: "student12@etutor.com", password: "student123", name: "Amelia Jackson", degreeProgram: "BSc Mathematics" },
  { email: "student13@etutor.com", password: "student123", name: "Benjamin White", degreeProgram: "BSc Data Science" },
  { email: "student14@etutor.com", password: "student123", name: "Harper Harris", degreeProgram: "BEng Software Engineering" },
  { email: "student15@etutor.com", password: "student123", name: "Jack Martin", degreeProgram: "BSc Computer Science" },
  { email: "student16@etutor.com", password: "student123", name: "Evelyn Thompson", degreeProgram: "BSc Mathematics" },
  { email: "student17@etutor.com", password: "student123", name: "Alexander Moore", degreeProgram: "BEng Electrical Engineering" },
  { email: "student18@etutor.com", password: "student123", name: "Abigail Clark", degreeProgram: "BSc Data Science" },
  { email: "student19@etutor.com", password: "student123", name: "Daniel Lewis", degreeProgram: "BEng Software Engineering" },
  { email: "student20@etutor.com", password: "student123", name: "Ella Walker", degreeProgram: "BSc Computer Science" },
]

// -------------------- SEED FUNCTIONS --------------------

async function seedUsers() {
  console.log("Seeding users...")

  // Pre-hash all passwords before any DB calls to avoid connection timeouts
  console.log("  Hashing passwords...")
  const allUsers = [
    ...admins.map((u) => ({ ...u, role: "admin" })),
    ...tutors.map((u) => ({ ...u, role: "tutor" })),
    ...students.map((u) => ({ ...u, role: "student" })),
  ]
  const hashes = await Promise.all(allUsers.map((u) => hashPassword(u.password)))
  const hashedUsers = allUsers.map((u, i) => ({ ...u, passwordHash: hashes[i] }))

  const createdUsers = { admins: [], tutors: [], students: [] }

  for (const entry of hashedUsers) {
    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: {},
      create: {
        email: entry.email,
        passwordHash: entry.passwordHash,
        name: entry.name,
        role: entry.role,
        department: entry.department || null,
        degreeProgram: entry.degreeProgram || null,
      },
    })

    const tag = entry.role.toUpperCase()
    if (entry.role === "admin") createdUsers.admins.push(user)
    else if (entry.role === "tutor") createdUsers.tutors.push(user)
    else createdUsers.students.push(user)
    console.log(`  [${tag}] ${user.email}`)
  }

  console.log(`  Total: ${admins.length} admins, ${tutors.length} tutors, ${students.length} students\n`)
  return createdUsers
}

async function seedAllocations(users) {
  console.log("Seeding allocations...")

  const allocations = []
  for (let i = 0; i < users.students.length; i++) {
    const tutor = users.tutors[i % users.tutors.length]
    const student = users.students[i]

    const allocation = await prisma.allocation.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        tutorId: tutor.id,
        reason: "Initial allocation",
      },
    })
    allocations.push(allocation)
    console.log(`  [ALLOCATED] ${student.name} -> ${tutor.name}`)
  }

  console.log(`  Total: ${allocations.length} allocations\n`)
  return allocations
}

async function seedMessages(users) {
  console.log("Seeding messages...")

  const messagePairs = [
    { from: users.students[0], to: users.tutors[0], body: "Hi Dr. Chen, I have a question about the assignment deadline." },
    { from: users.tutors[0], to: users.students[0], body: "Hi Liam, the deadline is next Friday. Let me know if you need an extension." },
    { from: users.students[1], to: users.tutors[0], body: "Could we schedule a meeting to discuss my dissertation topic?" },
    { from: users.tutors[1], to: users.students[2], body: "Noah, please review the feedback I left on your document." },
    { from: users.students[4], to: users.tutors[2], body: "Dr. Brown, I submitted my project proposal for review." },
    { from: users.admins[0], to: users.tutors[0], body: "Reminder: Staff meeting scheduled for Monday at 10 AM." },
    { from: users.tutors[3], to: users.students[10], body: "Henry, great progress on your circuit design project!" },
    { from: users.students[6], to: users.tutors[4], body: "Dr. Taylor, could you recommend resources for machine learning?" },
  ]

  let count = 0
  for (const msg of messagePairs) {
    await prisma.message.create({
      data: {
        senderId: msg.from.id,
        recipientId: msg.to.id,
        messageBody: msg.body,
        isRead: Math.random() > 0.5,
      },
    })
    count++
    console.log(`  [MSG] ${msg.from.name} -> ${msg.to.name}`)
  }

  console.log(`  Total: ${count} messages\n`)
}

async function seedBlogPosts(users) {
  console.log("Seeding blog posts...")

  const posts = [
    { tutor: users.tutors[0], student: users.students[0], title: "Week 1 Progress - Liam", content: "Liam has completed the introductory module and shows strong understanding of core concepts.", sorting: 1 },
    { tutor: users.tutors[0], student: users.students[1], title: "Week 1 Progress - Emma", content: "Emma has started working on her first programming assignment. Good initial progress.", sorting: 1 },
    { tutor: users.tutors[1], student: users.students[2], title: "Research Proposal Review", content: "Noah submitted a solid research proposal on number theory. Minor revisions needed.", sorting: 1 },
    { tutor: users.tutors[2], student: users.students[4], title: "Project Milestone 1", content: "Oliver delivered the first milestone of his software engineering project ahead of schedule.", sorting: 1 },
    { tutor: users.tutors[4], student: users.students[6], title: "Data Science Fundamentals", content: "Elijah is progressing well through the statistics module. Recommended additional reading materials.", sorting: 1 },
  ]

  const createdPosts = []
  for (const post of posts) {
    const blogPost = await prisma.blogPost.create({
      data: {
        tutorId: post.tutor.id,
        studentId: post.student.id,
        title: post.title,
        content: post.content,
        sorting: post.sorting,
        createdBy: post.tutor.id,
      },
    })
    createdPosts.push(blogPost)
    console.log(`  [POST] "${post.title}"`)
  }

  console.log(`  Total: ${createdPosts.length} blog posts\n`)
  return createdPosts
}

async function seedDocuments(users) {
  console.log("Seeding documents...")

  const docs = [
    { uploader: users.students[0], fileName: "assignment1.pdf", filePath: "/uploads/assignment1.pdf", fileSize: 204800, fileFormat: "application/pdf", sorting: 1 },
    { uploader: users.students[1], fileName: "research-notes.docx", filePath: "/uploads/research-notes.docx", fileSize: 153600, fileFormat: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sorting: 2 },
    { uploader: users.tutors[0], fileName: "syllabus-cs101.pdf", filePath: "/uploads/syllabus-cs101.pdf", fileSize: 512000, fileFormat: "application/pdf", sorting: 1 },
    { uploader: users.students[4], fileName: "project-proposal.pdf", filePath: "/uploads/project-proposal.pdf", fileSize: 307200, fileFormat: "application/pdf", sorting: 3 },
    { uploader: users.tutors[1], fileName: "math-exercises.pdf", filePath: "/uploads/math-exercises.pdf", fileSize: 409600, fileFormat: "application/pdf", sorting: 2 },
    { uploader: users.students[6], fileName: "data-analysis.ipynb", filePath: "/uploads/data-analysis.ipynb", fileSize: 262144, fileFormat: "application/x-ipynb+json", sorting: 4 },
  ]

  const createdDocs = []
  for (const doc of docs) {
    const document = await prisma.document.create({
      data: {
        uploaderId: doc.uploader.id,
        fileName: doc.fileName,
        filePath: doc.filePath,
        fileSize: doc.fileSize,
        fileFormat: doc.fileFormat,
        sorting: doc.sorting,
      },
    })
    createdDocs.push(document)
    console.log(`  [DOC] ${doc.fileName} (by ${doc.uploader.name})`)
  }

  console.log(`  Total: ${createdDocs.length} documents\n`)
  return createdDocs
}

async function seedComments(users, blogPosts, documents) {
  console.log("Seeding comments...")

  const comments = [
    { documentId: documents[0].id, commenterId: users.tutors[0].id, text: "Good work on the assignment. Please review section 3." },
    { documentId: documents[1].id, commenterId: users.tutors[0].id, text: "Interesting research direction. Let's discuss further in our next meeting." },
    { documentId: documents[3].id, commenterId: users.tutors[2].id, text: "The proposal is well-structured. Approved for next phase." },
    { blogId: blogPosts[0].id, commenterId: users.students[0].id, text: "Thank you for the feedback! I'll work on the next module." },
    { blogId: blogPosts[2].id, commenterId: users.students[2].id, text: "I've made the revisions you suggested. Please review when you can." },
    { documentId: documents[5].id, commenterId: users.tutors[4].id, text: "Great use of pandas for the analysis. Consider adding visualizations." },
  ]

  let count = 0
  for (const comment of comments) {
    await prisma.comment.create({
      data: {
        documentId: comment.documentId || null,
        blogId: comment.blogId || null,
        commenterId: comment.commenterId,
        commentText: comment.text,
      },
    })
    count++
    const target = comment.documentId ? "document" : "blog post"
    console.log(`  [COMMENT] on ${target}`)
  }

  console.log(`  Total: ${count} comments\n`)
}

async function seedMeetings(users) {
  console.log("Seeding meetings...")

  const now = new Date()

  const meetings = [
    { name: "Weekly Check-in: Liam", creator: users.tutors[0], tutorId: users.tutors[0].id, type: "virtual", date: new Date(now.getTime() + 2 * 86400000), duration: 30, link: "https://meet.etutor.com/room-101" },
    { name: "Dissertation Review: Emma", creator: users.tutors[0], tutorId: users.tutors[0].id, type: "in_person", date: new Date(now.getTime() + 3 * 86400000), duration: 60, location: "Room 204, CS Building" },
    { name: "Math Tutorial Group", creator: users.tutors[1], tutorId: users.tutors[1].id, type: "in_person", date: new Date(now.getTime() + 1 * 86400000), duration: 90, location: "Lecture Hall B" },
    { name: "Project Demo: Oliver", creator: users.students[4], tutorId: users.tutors[2].id, type: "virtual", date: new Date(now.getTime() + 5 * 86400000), duration: 45, link: "https://meet.etutor.com/room-205" },
    { name: "Staff Meeting", creator: users.admins[0], tutorId: null, type: "in_person", date: new Date(now.getTime() + 7 * 86400000), duration: 60, location: "Conference Room A" },
    { name: "Data Science Workshop", creator: users.tutors[4], tutorId: users.tutors[4].id, type: "virtual", date: new Date(now.getTime() + 4 * 86400000), duration: 120, link: "https://meet.etutor.com/workshop-ds" },
    { name: "Mid-term Review: Henry", creator: users.tutors[3], tutorId: users.tutors[3].id, type: "in_person", date: new Date(now.getTime() - 3 * 86400000), duration: 30, location: "Room 110, Engineering", status: "completed" },
    { name: "Cancelled: Group Session", creator: users.tutors[1], tutorId: users.tutors[1].id, type: "virtual", date: new Date(now.getTime() - 1 * 86400000), duration: 60, link: "https://meet.etutor.com/room-301", status: "cancelled" },
  ]

  let count = 0
  for (const m of meetings) {
    await prisma.meeting.create({
      data: {
        meetingName: m.name,
        meetingCreator: m.creator.id,
        tutorId: m.tutorId,
        meetingType: m.type,
        meetingStatus: m.status || "scheduled",
        scheduledDate: m.date,
        durationMinutes: m.duration,
        location: m.location || null,
        meetingLink: m.link || null,
      },
    })
    count++
    console.log(`  [MEETING] "${m.name}" (${m.status || "scheduled"})`)
  }

  console.log(`  Total: ${count} meetings\n`)
}

// -------------------- MAIN --------------------

async function main() {
  console.log("Starting database seed...\n")

  const users = await seedUsers()
  const allocations = await seedAllocations(users)
  const blogPosts = await seedBlogPosts(users)
  const documents = await seedDocuments(users)
  await seedMessages(users)
  await seedComments(users, blogPosts, documents)
  await seedMeetings(users)

  console.log("Seeding completed successfully!")
}

main()
  .catch((error) => {
    console.error(`\n[ERROR] ${error.message}`)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
