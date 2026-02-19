import { useEffect, useMemo, useState } from "react"
import { api } from "./lib/api.js"

const TABS = ["overview", "messages", "blogs", "documents", "meetings"]

export default function RolePortal({ user, doLogout }) {
  const [tab, setTab] = useState("overview")
  const [error, setError] = useState("")
  const [summary, setSummary] = useState(null)
  const [contacts, setContacts] = useState([])
  const [inbox, setInbox] = useState([])
  const [activePeerId, setActivePeerId] = useState("")
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [blogs, setBlogs] = useState([])
  const [blogComments, setBlogComments] = useState({})
  const [newBlogComment, setNewBlogComment] = useState({})
  const [newBlog, setNewBlog] = useState({ title: "", content: "" })
  const [documents, setDocuments] = useState([])
  const [newDocument, setNewDocument] = useState({
    title: "",
    fileName: "",
    fileUrl: "",
    fileType: "",
    fileSize: null,
  })
  const [meetings, setMeetings] = useState([])
  const [newMeeting, setNewMeeting] = useState({
    studentId: "",
    tutorId: "",
    meetingType: "virtual",
    scheduledAt: "",
    notes: "",
  })
  const [meetingTargetOptions, setMeetingTargetOptions] = useState([])

  useEffect(() => {
    bootstrap()
  }, [user.role])

  useEffect(() => {
    if (activePeerId) loadMessages(activePeerId)
  }, [activePeerId])

  const activePeer = useMemo(
    () => contacts.find((c) => c.id === activePeerId) || null,
    [contacts, activePeerId],
  )

  async function bootstrap() {
    try {
      await Promise.all([
        loadOverview(),
        loadContacts(),
        loadInbox(),
        loadBlogs(),
        loadDocuments(),
        loadMeetings(),
      ])
    } catch (e) {
      setError(e.message)
    }
  }

  async function loadOverview() {
    if (user.role === "student") {
      const data = await api.studentEngagementSummary()
      setSummary(data.data)
    } else {
      const data = await api.tutorGroupStats()
      setSummary(data.data)
      setMeetingTargetOptions(data.data?.tutees || [])
    }
  }

  async function loadContacts() {
    const data = await api.listMessageContacts()
    const list = data.data || []
    setContacts(list)
    if (user.role === "student") {
      setMeetingTargetOptions(list.filter((x) => x.role === "tutor"))
    }
  }

  async function loadInbox() {
    const data = await api.listInbox()
    const rows = data.data || []
    setInbox(rows)
    if (rows.length && !activePeerId) setActivePeerId(rows[0].peer.id)
  }

  async function loadMessages(peerId) {
    const data = await api.listMessages(peerId)
    setMessages(data.data || [])
  }

  async function sendMessage() {
    if (!activePeerId || !newMessage.trim()) return
    try {
      await api.sendMessage({ recipientId: activePeerId, content: newMessage.trim() })
      setNewMessage("")
      await Promise.all([loadMessages(activePeerId), loadInbox()])
    } catch (e) {
      setError(e.message)
    }
  }

  async function loadBlogs() {
    const data = await api.listBlogs()
    setBlogs(data.data || [])
  }

  async function loadBlogDetail(postId) {
    try {
      const data = await api.getBlog(postId)
      setBlogComments((prev) => ({ ...prev, [postId]: data.comments || [] }))
    } catch (e) {
      setError(e.message)
    }
  }

  async function createBlog() {
    if (!newBlog.title.trim() || !newBlog.content.trim()) return
    try {
      await api.createBlog(newBlog)
      setNewBlog({ title: "", content: "" })
      await loadBlogs()
    } catch (e) {
      setError(e.message)
    }
  }

  async function addComment(postId, parentId = null) {
    const content = (newBlogComment[postId] || "").trim()
    if (!content) return
    try {
      await api.addBlogComment(postId, { content, parentId })
      setNewBlogComment((prev) => ({ ...prev, [postId]: "" }))
      await loadBlogDetail(postId)
    } catch (e) {
      setError(e.message)
    }
  }

  async function loadDocuments() {
    const data = await api.listDocuments()
    setDocuments(data.data || [])
  }

  async function createDocument() {
    if (!newDocument.title.trim() || !newDocument.fileName.trim()) return
    try {
      await api.createDocument(newDocument)
      setNewDocument({ title: "", fileName: "", fileUrl: "", fileType: "", fileSize: null })
      await loadDocuments()
    } catch (e) {
      setError(e.message)
    }
  }

  async function loadMeetings() {
    const data = await api.listMeetings()
    setMeetings(data.data || [])
    if (user.role === "student" && data.data?.[0]?.tutor) {
      setMeetingTargetOptions([data.data[0].tutor])
    }
  }

  async function createMeeting() {
    if (!newMeeting.scheduledAt) return
    try {
      await api.createMeeting(newMeeting)
      setNewMeeting((p) => ({ ...p, scheduledAt: "", notes: "" }))
      await loadMeetings()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="panel p-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{user.role === "student" ? "Student Portal" : "Tutor Portal"}</h1>
            <p className="text-sm text-[#64748B]">{user.name} - {user.email}</p>
          </div>
          <button className="btn-secondary" onClick={doLogout}>Logout</button>
        </div>

        <div className="panel p-2 flex gap-2">{TABS.map((x) => <button key={x} className={`tab-btn ${tab === x ? "active" : ""}`} onClick={() => setTab(x)}>{x}</button>)}</div>
        {error ? <p className="text-sm text-[#EF4444]">{error}</p> : null}

        {tab === "overview" && (
          <div className="space-y-3">
            {!summary ? <div className="panel p-5 text-[#64748B]">Loading overview...</div> : null}
            {user.role === "student" && summary ? (
              <>
                <div className="grid md:grid-cols-4 gap-3">
                  <StatCard title="Messages with Tutor" value={summary.messageCountWithTutor || 0} />
                  <StatCard title="Meetings" value={summary.meetingsCount || 0} />
                  <StatCard title="Blog Posts" value={summary.blogPostsCount || 0} />
                  <StatCard title="Documents" value={summary.documentUploadsCount || 0} />
                </div>
                <div className="panel p-5">
                  <p className="font-semibold mb-1">Assigned Tutor</p>
                  {summary.tutor ? <p>{summary.tutor.name} - {summary.tutor.email}</p> : <p className="text-[#64748B]">No tutor assigned yet.</p>}
                </div>
              </>
            ) : null}
            {user.role === "tutor" && summary ? (
              <>
                <div className="grid md:grid-cols-2 gap-3">
                  <StatCard title="Total Tutees" value={summary.tuteeCount || 0} />
                  <StatCard title="Avg Messages / Tutee" value={summary.avgMessagesPerTutee || 0} />
                </div>
                <div className="panel p-5">
                  <p className="font-semibold mb-3">Your Students</p>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-[#64748B]"><tr><th className="py-2">Name</th><th>ID</th><th>Department</th><th>Degree</th><th>Messages</th></tr></thead>
                      <tbody>
                        {(summary.tutees || []).map((s) => (
                          <tr key={s.id} className="border-t border-slate-200">
                            <td className="py-2 font-medium">{s.name}</td>
                            <td>{s.id}</td>
                            <td>{s.department || "-"}</td>
                            <td>{s.degreeProgram || "-"}</td>
                            <td>{s.messageCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {tab === "messages" && (
          <div className="grid md:grid-cols-[280px_1fr] gap-3">
            <div className="panel p-3 space-y-2">
              <p className="font-semibold text-sm">Conversations</p>
              {inbox.length ? inbox.map((x) => (
                <button key={x.peer.id} className={`w-full text-left border rounded-lg p-2 ${activePeerId === x.peer.id ? "bg-[#EEF4FF] border-[#BFDBFE]" : "border-slate-200"}`} onClick={() => setActivePeerId(x.peer.id)}>
                  <p className="font-medium">{x.peer.name}</p>
                  <p className="text-xs text-[#64748B]">{x.peer.role}</p>
                  {x.unreadCount ? <p className="text-xs text-[#EF4444]">{x.unreadCount} unread</p> : null}
                </button>
              )) : <p className="text-sm text-[#64748B]">No messages yet.</p>}
              <div className="pt-2 border-t">
                <p className="text-xs text-[#64748B] mb-1">Create New Message</p>
                <select className="w-full h-10 border border-slate-200 rounded-lg px-2" value={activePeerId} onChange={(e) => setActivePeerId(e.target.value)}>
                  <option value="">Select who to message</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.role}) - {c.id}</option>)}
                </select>
              </div>
            </div>
            <div className="panel p-3 space-y-3">
              <div className="text-sm text-[#64748B]">{activePeer ? `Chat with ${activePeer.name}` : "Select contact to start chatting"}</div>
              <div className="h-[420px] overflow-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-white">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[70%] rounded-lg p-2 ${m.senderId === user.id ? "bg-[#2563EB] text-white ml-auto" : "bg-slate-100 text-slate-900"}`}>
                    <p className="text-sm">{m.content}</p>
                    <p className="text-[11px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 h-11 border border-slate-200 rounded-lg px-3" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type message..." />
                <button className="btn-primary" onClick={sendMessage} disabled={!activePeerId}>Send</button>
              </div>
            </div>
          </div>
        )}

        {tab === "blogs" && (
          <div className="space-y-3">
            <div className="panel p-4 grid gap-2">
              <input className="h-10 border border-slate-200 rounded-lg px-3" placeholder="Blog title" value={newBlog.title} onChange={(e) => setNewBlog((p) => ({ ...p, title: e.target.value }))} />
              <textarea className="border border-slate-200 rounded-lg px-3 py-2 min-h-[110px]" placeholder="Write content..." value={newBlog.content} onChange={(e) => setNewBlog((p) => ({ ...p, content: e.target.value }))} />
              <button className="btn-primary w-fit" onClick={createBlog}>Post Blog</button>
            </div>
            {blogs.map((b) => (
              <div key={b.id} className="panel p-4 space-y-3">
                <div>
                  <p className="text-lg font-semibold">{b.title}</p>
                  <p className="text-sm text-[#64748B]">by {b.author.name} ({b.author.role})</p>
                  <p className="mt-2 text-sm">{b.content}</p>
                </div>
                <div className="space-y-2">
                  <button className="btn-secondary" onClick={() => loadBlogDetail(b.id)}>Load Comments</button>
                  {(blogComments[b.id] || []).map((c) => (
                    <div key={c.id} className={`border rounded-lg p-2 ${c.parentId ? "ml-8 border-slate-200" : "border-slate-300"}`}>
                      <p className="text-sm"><span className="font-semibold">{c.author.name}:</span> {c.content}</p>
                      <p className="text-xs text-[#64748B]">{new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-10 border border-slate-200 rounded-lg px-3"
                      placeholder="Write comment..."
                      value={newBlogComment[b.id] || ""}
                      onChange={(e) => setNewBlogComment((prev) => ({ ...prev, [b.id]: e.target.value }))}
                    />
                    <button className="btn-primary" onClick={() => addComment(b.id)}>Comment</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "documents" && (
          <div className="space-y-3">
            <div className="panel p-4 grid gap-2">
              <input className="h-10 border border-slate-200 rounded-lg px-3" placeholder="Document title" value={newDocument.title} onChange={(e) => setNewDocument((p) => ({ ...p, title: e.target.value }))} />
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  className="h-10 border border-slate-200 rounded-lg px-2 py-1 w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setNewDocument((p) => ({
                      ...p,
                      fileName: file.name,
                      fileType: file.type || "",
                      fileSize: file.size || null,
                      fileUrl: `local://${file.name}`,
                    }))
                  }}
                />
                {newDocument.fileName ? <span className="text-xs text-[#64748B]">{newDocument.fileName}</span> : null}
              </div>
              <input className="h-10 border border-slate-200 rounded-lg px-3" placeholder="Optional file URL override" value={newDocument.fileUrl} onChange={(e) => setNewDocument((p) => ({ ...p, fileUrl: e.target.value }))} />
              <button className="btn-primary w-fit" onClick={createDocument}>Upload Document</button>
            </div>
            {documents.map((d) => <div key={d.id} className="panel p-4"><p className="font-semibold">{d.title}</p><p className="text-sm text-[#64748B]">{d.fileName} {d.fileType ? `(${d.fileType})` : ""}</p><a className="text-sm text-[#2563EB]" href={d.fileUrl} target="_blank" rel="noreferrer">{d.fileUrl}</a></div>)}
          </div>
        )}

        {tab === "meetings" && (
          <div className="space-y-3">
            <div className="panel p-4 grid md:grid-cols-2 gap-2">
              {user.role === "tutor" ? (
                <select className="h-10 border border-slate-200 rounded-lg px-3" value={newMeeting.studentId} onChange={(e) => setNewMeeting((p) => ({ ...p, studentId: e.target.value }))}>
                  <option value="">Select Student (Name - ID)</option>
                  {meetingTargetOptions.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.id}</option>)}
                </select>
              ) : (
                <select className="h-10 border border-slate-200 rounded-lg px-3" value={newMeeting.tutorId} onChange={(e) => setNewMeeting((p) => ({ ...p, tutorId: e.target.value }))}>
                  <option value="">Select Tutor (Name - ID)</option>
                  {meetingTargetOptions.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.id}</option>)}
                </select>
              )}
              <select className="h-10 border border-slate-200 rounded-lg px-3" value={newMeeting.meetingType} onChange={(e) => setNewMeeting((p) => ({ ...p, meetingType: e.target.value }))}>
                <option value="virtual">Virtual</option>
                <option value="in_person">In Person</option>
              </select>
              <input className="h-10 border border-slate-200 rounded-lg px-3" type="datetime-local" value={newMeeting.scheduledAt} onChange={(e) => setNewMeeting((p) => ({ ...p, scheduledAt: e.target.value }))} />
              <input className="h-10 border border-slate-200 rounded-lg px-3" placeholder="Notes" value={newMeeting.notes} onChange={(e) => setNewMeeting((p) => ({ ...p, notes: e.target.value }))} />
              <button className="btn-primary w-fit" onClick={createMeeting}>Create Meeting</button>
            </div>
            <div className="panel overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[#64748B]"><tr><th className="p-3">Date</th><th>Student</th><th>Tutor</th><th>Type</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={m.id} className="border-t border-slate-200">
                      <td className="p-3">{new Date(m.scheduledAt).toLocaleString()}</td>
                      <td>{m.student.name}</td>
                      <td>{m.tutor.name}</td>
                      <td>{m.meetingType}</td>
                      <td>{m.meetingStatus}</td>
                      <td>{m.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="panel p-4">
      <p className="text-sm text-[#64748B]">{title}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  )
}
