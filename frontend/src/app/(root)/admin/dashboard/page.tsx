"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "@/lib/axios";
import Link from "next/link";
import { Skeleton } from "@mui/material";

interface StatCard {
  label: string | React.ReactNode;
  value: string;
  iconBg?: string;
  icon?: React.ReactNode;
}

interface DashboardData {
  statCards: Array<{
    label: string;
    value: string;
  }>;
  weeklyMeetings: Array<{
    week: string;
    count: number;
  }>;
  distributionData: Array<{
    subject: string;
    students: number;
  }>;
  atRiskStudents: Array<{
    id: string;
    name: string;
    course: string;
    tutorName?: string;
    meetingsInLast6Weeks?: number;
    status: string;
  }>;
  atRiskDefinition?: string;
}

interface MostActiveUserRow {
  userId: string;
  eventCount: number;
  name: string | null;
  email: string;
  role: string | null;
}

const getStatCardConfig = (label: string): Partial<StatCard> => {
  const configs: { [key: string]: Partial<StatCard> } = {
    "Total Students": {
      iconBg: "bg-blue-50",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.12805C16.8578 3.35042 17.6174 3.85132 18.1597 4.55211C18.702 5.25291 18.9962 6.11394 18.9962 7.00005C18.9962 7.88616 18.702 8.74719 18.1597 9.44799C17.6174 10.1488 16.8578 10.6497 16 10.8721"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    "Active Tutors": {
      iconBg: "bg-emerald-50",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.42 10.922C21.5991 10.843 21.751 10.7133 21.857 10.5488C21.963 10.3843 22.0184 10.1924 22.0164 9.99673C22.0143 9.80108 21.955 9.61031 21.8456 9.44807C21.7362 9.28584 21.5817 9.15925 21.401 9.08399L12.83 5.17999C12.5695 5.06114 12.2864 4.99963 12 4.99963C11.7137 4.99963 11.4306 5.06114 11.17 5.17999L2.60004 9.07999C2.42201 9.15796 2.27056 9.28613 2.16421 9.44881C2.05786 9.61149 2.00122 9.80163 2.00122 9.99599C2.00122 10.1903 2.05786 10.3805 2.16421 10.5432C2.27056 10.7059 2.42201 10.834 2.60004 10.912L11.17 14.82C11.4306 14.9388 11.7137 15.0003 12 15.0003C12.2864 15.0003 12.5695 14.9388 12.83 14.82L21.42 10.922Z"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 10V16"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 12.5V16C6 16.7956 6.63214 17.5587 7.75736 18.1213C8.88258 18.6839 10.4087 19 12 19C13.5913 19 15.1174 18.6839 16.2426 18.1213C17.3679 17.5587 18 16.7956 18 16V12.5"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    "Students — no meetings (6 wks)": {
      iconBg: "bg-amber-50",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.7299 18L13.7299 3.99998C13.5555 3.69218 13.3025 3.43617 12.9969 3.25805C12.6912 3.07993 12.3437 2.98608 11.9899 2.98608C11.6361 2.98608 11.2887 3.07993 10.983 3.25805C10.6773 3.43617 10.4244 3.69218 10.2499 3.99998L2.24993 18C2.07361 18.3053 1.98116 18.6519 1.98194 19.0045C1.98272 19.3571 2.07671 19.7032 2.25438 20.0078C2.43204 20.3124 2.68708 20.5646 2.99362 20.7388C3.30017 20.9131 3.64734 21.0032 3.99993 21H19.9999C20.3508 20.9996 20.6955 20.9069 20.9992 20.7313C21.303 20.5556 21.5551 20.3031 21.7304 19.9991C21.9057 19.6951 21.998 19.3504 21.9979 18.9995C21.9978 18.6486 21.9054 18.3039 21.7299 18Z"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 9V13"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 17H12.01"
            stroke="#D97706"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    "Meetings created (6 wks)": {
      iconBg: "bg-purple-50",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 12H19.52C19.083 11.9991 18.6577 12.1413 18.3091 12.405C17.9606 12.6686 17.708 13.0392 17.59 13.46L15.24 21.82C15.2249 21.8719 15.1933 21.9175 15.15 21.95C15.1067 21.9825 15.0541 22 15 22C14.9459 22 14.8933 21.9825 14.85 21.95C14.8067 21.9175 14.7751 21.8719 14.76 21.82L9.24 2.18C9.22485 2.12807 9.19327 2.08246 9.15 2.05C9.10673 2.01754 9.05409 2 9 2C8.94591 2 8.89327 2.01754 8.85 2.05C8.80673 2.08246 8.77515 2.12807 8.76 2.18L6.41 10.54C6.29246 10.9592 6.04138 11.3285 5.69486 11.592C5.34835 11.8555 4.92532 11.9988 4.49 12H2"
            stroke="#9333EA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  };
  return configs[label] || {};
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [activityDays, setActivityDays] = useState<7 | 30>(7);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityRows, setActivityRows] = useState<MostActiveUserRow[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/dashboard");
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadActivity = async () => {
      try {
        setActivityLoading(true);
        const res = await axios.get("/api/admin/reports/most-active-users", {
          params: { days: activityDays, limit: 10 },
        });
        if (!cancelled) {
          setActivityRows(res.data.data.topUsers ?? []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setActivityRows([]);
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    };
    loadActivity();
    return () => {
      cancelled = true;
    };
  }, [activityDays]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statCards: StatCard[] = (dashboardData?.statCards || []).map(
    (card) => ({
      ...card,
      ...getStatCardConfig(card.label),
    }),
  );

  const weeklyMeetings = dashboardData?.weeklyMeetings || [];
  const distributionData = dashboardData?.distributionData || [];
  const atRiskStudents = dashboardData?.atRiskStudents || [];
  const atRiskDefinition = dashboardData?.atRiskDefinition;
  const meetingsChartMax = Math.max(
    4,
    ...weeklyMeetings.map((w) => w.count),
    1,
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-inter">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, Admin
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
            <p className="mt-3">
              <Link
                href="/admin/view-as"
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                View as student or tutor
              </Link>
              <span className="text-sm text-gray-500 ml-2">
                (dashboard preview, read-only)
              </span>
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={100}
                    sx={{ borderRadius: "12px" }}
                  />
                ))}
              </>
            ) : (
              statCards.map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 leading-tight">
                      {card.label}
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {card.value}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Meetings created per week (real counts) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-slate-900">
                Meetings created (weekly)
              </h2>
              <p className="text-xs text-gray-500 mt-1 mb-6">
                Count of new meetings per 7-day bucket, last 6 weeks (UTC).
              </p>
              {loading ? (
                <Skeleton variant="rectangular" height={260} />
              ) : weeklyMeetings.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={weeklyMeetings}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#F3F4F6"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, meetingsChartMax]}
                      allowDecimals={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Meetings"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{
                        fill: "#2563EB",
                        stroke: "#2563EB",
                        r: 4,
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Student Distribution */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-[15px] font-semibold text-slate-900 mb-6">
                Student Distribution
              </h2>
              {loading ? (
                <Skeleton variant="rectangular" height={260} />
              ) : distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={distributionData}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#F3F4F6"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="subject"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 12]}
                      ticks={[0, 3, 6, 9, 12]}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar
                      dataKey="students"
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={56}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Assigned students with no recent meetings */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-[15px] font-semibold text-slate-900">
              Assigned students — no meetings (6 weeks)
            </h2>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              {atRiskDefinition ??
                "Assigned students with no meetings in the rolling 6-week window."}{" "}
              Table shows up to 10; the stat card is the full count.
            </p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={40}
                    sx={{ borderRadius: "8px" }}
                  />
                ))}
              </div>
            ) : atRiskStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50 rounded-lg">
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5 rounded-l-lg">
                        Name
                      </th>
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5">
                        Course
                      </th>
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5">
                        Tutor
                      </th>
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5 rounded-r-lg">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {atRiskStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-900">
                            {student.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">
                            {student.course}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">
                            {student.tutorName ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-900">
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No assigned students without meetings in this window.
              </div>
            )}
          </div>

          {/* Most active users (logged actions: login, messages, meetings, uploads) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">
                  Most active users
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  By event count (logins, messages sent, meetings created,
                  document uploads). Top 10.
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setActivityDays(7)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activityDays === 7
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  type="button"
                  onClick={() => setActivityDays(30)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activityDays === 30
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Last 30 days
                </button>
              </div>
            </div>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={40}
                    sx={{ borderRadius: "8px" }}
                  />
                ))}
              </div>
            ) : activityRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="bg-gray-50 rounded-lg">
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5 rounded-l-lg w-12">
                        #
                      </th>
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5">
                        User
                      </th>
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5">
                        Email
                      </th>
                      <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5">
                        Role
                      </th>
                      <th className="text-right text-[10px] font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5 rounded-r-lg">
                        Events
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityRows.map((row, i) => (
                      <tr
                        key={row.userId}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-900">
                            {row.name || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">
                            {row.email}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 capitalize">
                            {row.role ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-bold text-blue-600 tabular-nums">
                            {row.eventCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-sm">
                No activity logged in this period yet. Events appear after users
                log in, send messages, create meetings, or upload documents.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
