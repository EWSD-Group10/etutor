"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Alert, Button } from "@mui/material";
import axios from "@/lib/axios";
import TutorDashboardContent, {
  type TutorDashboardPayload,
} from "@/app/components/dashboard/TutorDashboardContent";

interface ViewAsMeta {
  userId: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AdminViewAsTutorPage() {
  const params = useParams();
  const userId = typeof params.userId === "string" ? params.userId : "";

  const [data, setData] = useState<TutorDashboardPayload | null>(null);
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
          `/api/admin/view-as/tutor/${userId}/dashboard`,
        );
        if (cancelled) return;
        const raw = res.data.data as TutorDashboardPayload & {
          viewAs: ViewAsMeta;
        };
        const { viewAs: va, ...rest } = raw;
        setViewAs(va);
        setData(rest);
        setErr(null);
      } catch {
        if (!cancelled) {
          setErr("Could not load this tutor’s dashboard.");
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

  const displayName = viewAs?.name ?? "Tutor";

  return (
    <>
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        <strong>View as tutor</strong> — data for{" "}
        {viewAs?.name ?? "…"} ({viewAs?.email})
        {!viewAs?.isActive ? " · inactive user" : ""}. Read-only preview;
        tutor links are hidden.
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
        <TutorDashboardContent
          dashboardData={data}
          dataLoading={loading}
          headerLoading={loading}
          displayName={displayName}
          previewMode
        />
      )}
    </>
  );
}
