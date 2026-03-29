"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Link from "next/link";

interface UserActivityEventRow {
  id: string;
  userId: string;
  action: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user: { id: string; name?: string | null; email?: string | null };
}

export default function AdminUserActivityPage() {
  const [events, setEvents] = useState<UserActivityEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get("/api/admin/reports/user-activity", {
          params: { limit },
        });
        setEvents(res.data.data.events || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load user activity events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [limit]);

  return (
    <main className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Activity Audit</h1>
          <p className="text-sm text-gray-500">
            Login events with device/browser and IP.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Back to admin dashboard
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : events.length === 0 ? (
        <p>No activity events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  When
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  User
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  Action
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  User-Agent
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {event.user.name || event.user.email || event.userId}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {event.action}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600 break-words max-w-[300px]">
                    {event.userAgent || "-"}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {event.ipAddress || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
