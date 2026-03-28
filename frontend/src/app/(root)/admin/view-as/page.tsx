"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/lib/axios";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
}

export default function AdminViewAsIndexPage() {
  const [students, setStudents] = useState<UserRow[]>([]);
  const [tutors, setTutors] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [sRes, tRes] = await Promise.all([
          axios.get("/api/students", { params: { page: 1, limit: 100 } }),
          axios.get("/api/tutors", { params: { page: 1, limit: 100 } }),
        ]);
        if (cancelled) return;
        setStudents(sRes.data.data ?? []);
        setTutors(tRes.data.data ?? []);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setStudents([]);
          setTutors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterRows = (rows: UserRow[], q: string) => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) =>
        (r.name?.toLowerCase().includes(t) ?? false) ||
        r.email.toLowerCase().includes(t),
    );
  };

  const filteredStudents = filterRows(students, studentSearch);
  const filteredTutors = filterRows(tutors, tutorSearch);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="p-6 md:p-8 max-w-[1000px] mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Admin dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">
            View as student or tutor
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Open the same dashboard summaries a user would see. Actions and deep
            links are disabled in preview mode.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading users…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-[15px] font-semibold text-slate-900 mb-3">
                Students
              </h2>
              <input
                type="search"
                placeholder="Filter by name or email…"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full mb-3 px-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
              <ul className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <li className="py-3 text-sm text-gray-500">No matches</li>
                ) : (
                  filteredStudents.map((u) => (
                    <li key={u.id} className="py-2">
                      <Link
                        href={`/admin/view-as/student/${u.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {u.name || "—"}
                      </Link>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-[15px] font-semibold text-slate-900 mb-3">
                Tutors
              </h2>
              <input
                type="search"
                placeholder="Filter by name or email…"
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                className="w-full mb-3 px-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
              <ul className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                {filteredTutors.length === 0 ? (
                  <li className="py-3 text-sm text-gray-500">No matches</li>
                ) : (
                  filteredTutors.map((u) => (
                    <li key={u.id} className="py-2">
                      <Link
                        href={`/admin/view-as/tutor/${u.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {u.name || "—"}
                      </Link>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
