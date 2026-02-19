import { useEffect, useMemo, useState } from "react"
import { api } from "./lib/api.js"
import RolePortal from "./RolePortal.jsx"

const NAV = ["dashboard", "students", "tutors", "allocation"]

export default function App() {
  const [session, setSession] = useState({ loading: true, user: null })
  const [err, setErr] = useState("")
  const [note, setNote] = useState("")
  const [login, setLogin] = useState({ email: "", password: "" })
  const [view, setView] = useState("dashboard")
  const [search, setSearch] = useState("")
  const [allocationTab, setAllocationTab] = useState("all")
  const [dash, setDash] = useState({ stats: {}, chartTrend: [], distribution: [] })
  const [students, setStudents] = useState([])
  const [tutors, setTutors] = useState([])
  const [allocs, setAllocs] = useState([])
  const [unassigned, setUnassigned] = useState([])
  const [studentModal, setStudentModal] = useState(null)
  const [tutorModal, setTutorModal] = useState(null)
  const [allocModal, setAllocModal] = useState(null)
  const [allocDetails, setAllocDetails] = useState(null)

  useEffect(() => {
    refreshSession()
  }, [])

  const rows = useMemo(() => {
    if (view === "students") return students.filter((x) => match(x, search))
    if (view === "tutors") return tutors.filter((x) => match(x, search))
    if (view !== "allocation") return []
    const data =
      allocationTab === "unassigned"
        ? unassigned.map((s) => ({ kind: "unassigned", student: s }))
        : allocs.map((a) => ({ kind: "assigned", ...a }))
    return data.filter((x) =>
      match({ name: x.student.name, email: x.student.email, department: x.tutor?.name || "" }, search),
    )
  }, [view, students, tutors, allocs, unassigned, search, allocationTab])

  async function refreshSession() {
    try {
      const me = await api.currentUser()
      setSession({ loading: false, user: me.user })
      try {
        if (me.user.role === "admin") await loadAdmin()
      } catch (loadErr) {
        setErr(loadErr.message || "Failed to load dashboard data")
      }
    } catch {
      setSession({ loading: false, user: null })
    }
  }
  async function loadAdmin() {
    const [a, s, t, l, u] = await Promise.all([
      api.adminDashboard(),
      api.listStudents("limit=100"),
      api.listTutors("limit=100"),
      api.listAllocations("limit=100"),
      api.listUnassignedStudents(),
    ])
    setDash({ stats: a.stats || {}, chartTrend: a.chartTrend || [], distribution: a.distribution || [] })
    setStudents(s.data || [])
    setTutors(t.data || [])
    setAllocs(l.data || [])
    setUnassigned(u.data || [])
  }
  async function doLogin(e) {
    e.preventDefault()
    setErr("")
    try {
      await api.login(login)
      await refreshSession()
    } catch (e2) {
      setErr(e2.message)
    }
  }
  async function doLogout() {
    try {
      await api.logout()
    } catch {}
    setSession({ loading: false, user: null })
  }
  async function saveStudent() {
    try {
      if (studentModal.id) await api.updateStudent(studentModal.id, studentModal)
      else await api.createStudent(studentModal)
      setStudentModal(null); await loadAdmin(); setNote("Student saved.")
    } catch (e) { setErr(e.message) }
  }
  async function saveTutor() {
    try {
      if (tutorModal.id) await api.updateTutor(tutorModal.id, tutorModal)
      else await api.createTutor(tutorModal)
      setTutorModal(null); await loadAdmin(); setNote("Tutor saved.")
    } catch (e) { setErr(e.message) }
  }
  async function saveBulkAllocation() {
    try {
      await api.bulkCreateAllocations(allocModal)
      setAllocModal(null); await loadAdmin(); setNote("Allocation saved.")
    } catch (e) { setErr(e.message) }
  }

  if (session.loading) return <div className="p-8">Loading...</div>
  if (!session.user) return <Login err={err} login={login} setLogin={setLogin} doLogin={doLogin} />
  if (session.user.role !== "admin") {
    return <RolePortal user={session.user} doLogout={doLogout} />
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900">
      <div className="flex">
        <aside className="w-20 min-h-screen bg-white border-r flex flex-col items-center py-5 justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#EEF4FF] text-[#2563EB] grid place-items-center font-semibold">E</div>
            {NAV.map((n) => <button key={n} className={`h-10 w-10 rounded-lg ${view===n?"bg-[#EAF0FF] text-[#2563EB]":"text-[#64748B]"}`} onClick={()=>{setView(n);setSearch("")}}>{n[0].toUpperCase()}</button>)}
          </div>
          <div className="space-y-2">
            <div className="h-9 w-9 rounded-full bg-slate-100 grid place-items-center text-xs">AD</div>
            <button className="h-9 w-9 rounded-lg border" onClick={doLogout}>O</button>
          </div>
        </aside>
        <main className="flex-1 p-8 space-y-5">
          <header className="flex items-start justify-between">
            <div><h1 className="text-4xl font-semibold">{title(view)}</h1><p className="text-sm text-[#64748B]">{new Date().toDateString()}</p></div>
            {view==="students"&&<button className="btn-primary" onClick={()=>setStudentModal({name:"",email:"",password:"",department:"",degreeProgram:"",yearLevel:1})}>+ Add Student</button>}
            {view==="tutors"&&<button className="btn-primary" onClick={()=>setTutorModal({name:"",email:"",password:"",department:"",degreeProgram:"",maxStudents:15})}>+ Add Tutor</button>}
            {view==="allocation"&&<button className="btn-primary" onClick={()=>setAllocModal({tutorId:"",studentIds:[],reason:"",notes:""})}>New Allocation</button>}
          </header>
          {err && <p className="text-sm text-[#EF4444]">{err}</p>}
          {note && <p className="text-sm text-[#10B981]">{note}</p>}
          {view==="dashboard"&&<Dashboard dash={dash} />}
          {view!=="dashboard"&&(
            <>
              <div className="panel p-3 flex gap-2 items-center">
                {view==="allocation"&&<>
                  <button className={`tab-btn ${allocationTab==="all"?"active":""}`} onClick={()=>setAllocationTab("all")}>All Allocations</button>
                  <button className={`tab-btn ${allocationTab==="unassigned"?"active":""}`} onClick={()=>setAllocationTab("unassigned")}>Unassigned Students</button>
                  <button className={`tab-btn ${allocationTab==="assigned"?"active":""}`} onClick={()=>setAllocationTab("assigned")}>Assigned Students</button>
                </>}
                <input className="h-10 border rounded-lg px-3 ml-auto min-w-[220px]" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} />
              </div>
              {view==="students"&&<Students rows={rows} setStudentModal={setStudentModal} loadAdmin={loadAdmin} setErr={setErr} />}
              {view==="tutors"&&<Tutors rows={rows} setTutorModal={setTutorModal} loadAdmin={loadAdmin} setErr={setErr} />}
              {view==="allocation"&&<Alloc rows={rows} setAllocDetails={setAllocDetails} setAllocModal={setAllocModal} />}
            </>
          )}
        </main>
      </div>
      {studentModal&&<Modal title={studentModal.id?"Edit Student":"Add Student"} close={()=>setStudentModal(null)}><Editor state={studentModal} setState={setStudentModal} fields={["name","email","password","department","degreeProgram","yearLevel"]} submit={saveStudent} /></Modal>}
      {tutorModal&&<Modal title={tutorModal.id?"Edit Tutor":"Add Tutor"} close={()=>setTutorModal(null)}><Editor state={tutorModal} setState={setTutorModal} fields={["name","email","password","department","degreeProgram","maxStudents"]} submit={saveTutor} /></Modal>}
      {allocModal&&<Modal title="Bulk Allocate Students" close={()=>setAllocModal(null)} wide><Bulk tutors={tutors} students={unassigned} state={allocModal} setState={setAllocModal} submit={saveBulkAllocation} /></Modal>}
      {allocDetails&&<Modal title="Allocation Details" close={()=>setAllocDetails(null)}><AllocDetails item={allocDetails} tutors={tutors} close={()=>setAllocDetails(null)} loadAdmin={loadAdmin} setErr={setErr} /></Modal>}
    </div>
  )
}

const match = (x, s) => !s || `${x.name} ${x.email} ${x.department || ""}`.toLowerCase().includes(s.toLowerCase())
const title = (v) => ({ dashboard: "Welcome back, Admin", students: "Students Directory", tutors: "Tutors Directory", allocation: "Tutor Allocation" }[v])

function Login({ err, login, setLogin, doLogin }) { return <div className="min-h-screen grid place-items-center"><form onSubmit={doLogin} className="bg-white border rounded-xl p-6 w-full max-w-md space-y-3"><h1 className="text-2xl font-semibold">eTutor Login</h1><input className="w-full h-11 border rounded px-3" placeholder="Email" value={login.email} onChange={(e)=>setLogin((p)=>({...p,email:e.target.value}))}/><input className="w-full h-11 border rounded px-3" type="password" placeholder="Password" value={login.password} onChange={(e)=>setLogin((p)=>({...p,password:e.target.value}))}/>{err&&<p className="text-sm text-[#EF4444]">{err}</p>}<button className="btn-primary w-full">Sign In</button></form></div> }
function Dashboard({ dash }) { return <section className="space-y-4"><div className="grid md:grid-cols-4 gap-4">{["totalStudents","activeTutors","atRiskStudents","avgEngagement"].map((k)=><div key={k} className="panel p-4"><p className="text-sm text-[#64748B]">{k}</p><p className="text-4xl font-semibold">{k==="avgEngagement"?`${dash.stats[k]||0}%`:dash.stats[k]||0}</p></div>)}</div><div className="grid md:grid-cols-2 gap-4"><div className="panel p-4"><p className="font-semibold mb-3">Engagement Trend</p><div className="h-40 flex items-end gap-2">{(dash.chartTrend||[]).map((x)=><div key={x.label} className="flex-1"><div className="bg-[#2563EB] rounded-t" style={{height:`${x.value}%`}}/><p className="text-[11px] text-center text-[#64748B]">{x.label}</p></div>)}</div></div><div className="panel p-4"><p className="font-semibold mb-3">Student Distribution</p><div className="space-y-2">{(dash.distribution||[]).map((x)=><div key={x.label}><div className="flex justify-between text-sm"><span>{x.label}</span><span>{x.value}</span></div><div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-[#2563EB] rounded" style={{width:`${Math.min(100,x.value*10)}%`}}/></div></div>)}</div></div></div></section> }
function Students({ rows, setStudentModal, loadAdmin, setErr }) { return <div className="space-y-3">{rows.map((s)=><div key={s.id} className="panel p-4 flex items-center gap-4"><Avatar t={s.initials}/><div className="w-56"><p className="font-semibold">{s.name}</p><p className="text-sm text-[#64748B]">{s.email}</p></div><Col a="Degree" b={s.degreeProgram||"General"} /><Col a="Year" b={`Year ${s.year}`} /><div className="w-44"><p className="text-xs text-[#64748B]">Engagement</p><div className="h-2 bg-slate-100 rounded"><div className={`h-2 rounded ${s.engagement<35?"bg-[#EF4444]":s.engagement<60?"bg-[#D97706]":"bg-[#10B981]"}`} style={{width:`${s.engagement}%`}}/></div></div><Risk r={s.riskLevel}/><div className="ml-auto flex gap-2"><button className="icon-btn" onClick={()=>setStudentModal(s)}>E</button><button className="icon-btn text-[#EF4444]" onClick={async()=>{try{await api.deleteStudent(s.id);await loadAdmin()}catch(e){setErr(e.message)}}}>D</button></div></div>)}</div> }
function Tutors({ rows, setTutorModal, loadAdmin, setErr }) { return <div className="space-y-3">{rows.map((t)=><div key={t.id} className="panel p-4 flex items-center gap-4"><Avatar t={t.initials}/><div className="w-56"><p className="font-semibold">{t.name}</p><p className="text-sm text-[#64748B]">{t.email}</p></div><Col a="Department" b={t.department||"General"} /><div className="w-52"><p className="text-xs text-[#64748B]">Students</p><div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-[#2563EB] rounded" style={{width:`${Math.min(100,(t.assignedStudents/t.maxStudents)*100)}%`}}/></div><p className="text-xs">{t.assignedStudents}/{t.maxStudents}</p></div><span className="px-3 py-1 rounded-full text-xs bg-[#E7F8F1] text-[#10B981]">{t.status==="available"?"Available":"Full"}</span><div className="ml-auto flex gap-2"><button className="icon-btn" onClick={()=>setTutorModal(t)}>E</button><button className="icon-btn text-[#EF4444]" onClick={async()=>{try{await api.deleteTutor(t.id);await loadAdmin()}catch(e){setErr(e.message)}}}>D</button></div></div>)}</div> }
function Alloc({ rows, setAllocDetails, setAllocModal }) { return <div className="panel overflow-hidden"><div className="px-4 py-3 text-sm text-[#64748B] grid grid-cols-[1.2fr_1fr_1fr_120px] border-b"><div>Student</div><div>Tutor/Program</div><div>Details</div><div>Actions</div></div>{rows.map((r)=><div key={r.kind==="unassigned"?r.student.id:r.id} className="px-4 py-4 grid grid-cols-[1.2fr_1fr_1fr_120px] border-b items-center"><div><p className="font-medium">{r.student.name}</p><p className="text-sm text-[#64748B]">{r.student.email}</p></div><div>{r.kind==="unassigned"?<><p className="font-medium">{r.student.degreeProgram||"General"}</p><p className="text-sm text-[#64748B]">Year {r.student.year}</p></>:<><p className="font-medium">{r.tutor.name}</p><p className="text-sm text-[#64748B]">{r.tutor.department||"General"}</p></>}</div><div>{r.kind==="unassigned"?<Risk r={r.student.riskLevel}/>:<div className="text-sm text-[#64748B]"><p>{new Date(r.assignedAt).toLocaleDateString()}</p><p>{r.reason||"Initial assignment"}</p></div>}</div><div>{r.kind==="unassigned"?<button className="px-3 py-1 rounded-lg bg-[#2563EB] text-white text-sm" onClick={()=>setAllocModal({tutorId:"",studentIds:[r.student.id],reason:"",notes:""})}>Assign</button>:<button className="text-sm text-[#2563EB]" onClick={()=>setAllocDetails(r)}>Details</button>}</div></div>)}</div> }
function Bulk({ tutors, students, state, setState, submit }) { return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-3"><div className="space-y-2 max-h-72 overflow-auto">{tutors.map((t)=><button key={t.id} className={`w-full text-left p-3 rounded border ${state.tutorId===t.id?"bg-[#2563EB] text-white":"border-slate-200"}`} onClick={()=>setState((p)=>({...p,tutorId:t.id}))}><p className="font-medium">{t.name}</p><p className={state.tutorId===t.id?"text-white/80":"text-[#64748B]"}>{t.department}</p></button>)}</div><div className="space-y-2 max-h-72 overflow-auto">{students.map((s)=><label key={s.id} className="flex gap-2 border rounded p-2"><input type="checkbox" checked={state.studentIds.includes(s.id)} onChange={(e)=>setState((p)=>({...p,studentIds:e.target.checked?[...p.studentIds,s.id]:p.studentIds.filter((x)=>x!==s.id)}))}/><div><p className="font-medium">{s.name}</p><p className="text-sm text-[#64748B]">{s.degreeProgram} - Year {s.year}</p></div></label>)}</div><div className="space-y-2"><input className="w-full h-11 border rounded px-3" placeholder="Reason" value={state.reason} onChange={(e)=>setState((p)=>({...p,reason:e.target.value}))}/><input className="w-full h-11 border rounded px-3" placeholder="Notes" value={state.notes} onChange={(e)=>setState((p)=>({...p,notes:e.target.value}))}/><div className="p-3 rounded bg-[#EEF4FF] text-sm"><p>Tutor: {tutors.find((x)=>x.id===state.tutorId)?.name||"None"}</p><p>Students: {state.studentIds.length}</p></div></div></div><div className="flex justify-end gap-2"><button className="btn-secondary" onClick={submit}>Allocate Students</button></div></div> }
function AllocDetails({ item, tutors, close, loadAdmin, setErr }) { const [to, setTo] = useState(""); return <div className="space-y-3"><p><b>{item.student.name}</b> {"->"} {item.tutor.name}</p><p className="text-sm text-[#64748B]">{new Date(item.assignedAt).toLocaleDateString()} - {item.reason||"Initial assignment"}</p><select className="w-full h-11 border rounded px-3" value={to} onChange={(e)=>setTo(e.target.value)}><option value="">Select new tutor</option>{tutors.filter((t)=>t.id!==item.tutor.id).map((t)=><option key={t.id} value={t.id}>{t.name}</option>)}</select><div className="flex justify-between"><button className="px-4 py-2 rounded bg-[#EF4444] text-white" onClick={async()=>{try{await api.deleteAllocation(item.id);close();await loadAdmin()}catch(e){setErr(e.message)}}}>Remove</button><div className="flex gap-2"><button className="btn-secondary" onClick={close}>Close</button><button className="btn-primary" onClick={async()=>{if(!to)return;try{await api.updateAllocation(item.id,{tutorId:to});close();await loadAdmin()}catch(e){setErr(e.message)}}}>Reallocate</button></div></div></div> }
function Editor({ state, setState, fields, submit }) { return <form className="space-y-3" onSubmit={(e)=>{e.preventDefault();submit()}}>{fields.map((f)=><label key={f} className="block space-y-1"><span className="text-sm text-[#64748B]">{f}</span><input className="w-full h-11 border rounded px-3" type={f==="password"?"password":(f==="yearLevel"||f==="maxStudents")?"number":"text"} value={state[f]??""} onChange={(e)=>setState((p)=>({...p,[f]:(f==="yearLevel"||f==="maxStudents")?(e.target.value===""?"":Number(e.target.value)):e.target.value}))}/></label>)}<div className="flex justify-end"><button className="btn-primary">Save Changes</button></div></form> }
function Modal({ title, close, children, wide }) { return <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50"><div className={`bg-white rounded-2xl border shadow w-full ${wide?"max-w-5xl":"max-w-lg"}`}><div className="px-5 py-4 border-b flex justify-between"><h3 className="text-2xl font-semibold">{title}</h3><button onClick={close}>x</button></div><div className="p-5">{children}</div></div></div> }
function Avatar({ t }) { return <div className="h-11 w-11 rounded-full bg-slate-100 text-[#2563EB] font-semibold grid place-items-center">{t}</div> }
function Col({ a, b }) { return <div className="w-36"><p className="text-xs text-[#64748B]">{a}</p><p className="font-medium">{b}</p></div> }
function Risk({ r }) { const c=r==="high"?"bg-[#FDEDED] text-[#EF4444]":r==="at_risk"?"bg-[#FEF4E6] text-[#D97706]":"bg-[#E7F8F1] text-[#10B981]"; const t=r==="high"?"High Risk":r==="at_risk"?"At Risk":"On Track"; return <span className={`px-3 py-1 rounded-full text-xs ${c}`}>{t}</span> }

