"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Alert, Button } from "@mui/material";
import axios from "@/lib/axios";
import StudentDashboardContent, {
  type StudentDashboardPayload,
} from "@/app/components/dashboard/StudentDashboardContent";

interface ViewAsMeta {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AdminViewAsStudentPage() {
  const params = useParams();
  const userId = typeof params.userId === "string" ? params.userId : "";

  const [data, setData] = useState<StudentDashboardPayload | null>(null);
  const [viewAs, setViewAs] = useState<ViewAsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/admin/view-as/student/${userId}/dashboard`,
        );
        if (cancelled) return;
        const raw = res.data.data as StudentDashboardPayload & {
          viewAs: ViewAsMeta;
        };
        const { viewAs: va, ...rest } = raw;
        setViewAs(va);
        setData(rest);
        setErr(null);
      } catch {
        if (!cancelled) {
          setErr("Could not load this student’s dashboard.");
          setData(null);
          setViewAs(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const firstName = viewAs?.name?.split(" ")[0] ?? "Student";

  return (
    <>
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        <strong>View as student</strong> — data for{" "}
        {viewAs?.name ?? "…"} ({viewAs?.email})
        {!viewAs?.isActive ? " · inactive user" : ""}. Read-only preview;
        student navigation is hidden.
        <Button
          component={Link}
          href="/admin/view-as"
          size="small"
          sx={{ ml: 2 }}
        >
          Change user
        </Button>
        <Button
          component={Link}
          href="/admin/dashboard"
          size="small"
          sx={{ ml: 1 }}
        >
          Admin home
        </Button>
      </Alert>
      {err ? (
        <div className="p-6 text-red-600 text-sm">{err}</div>
      ) : (
        <StudentDashboardContent
          dashboardData={data}
          dataLoading={loading}
          headerLoading={loading}
          greetingName={firstName}
          previewMode
        />
      )}
    </>
  );
}
