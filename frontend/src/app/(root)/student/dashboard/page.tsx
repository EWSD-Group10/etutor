"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  alpha,
  Skeleton,
  Link as MuiLink,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EventIcon from "@mui/icons-material/Event";
import ArticleIcon from "@mui/icons-material/Article";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import DashboardSection from "@/app/components/dashboard/DashboardSection";
import AssignedTutorCard from "@/app/components/dashboard/AssignedTutorCard";
import DocumentListItem from "@/app/components/dashboard/DocumentListItem";
import axios from "@/lib/axios";

interface DashboardData {
  degreeProgram: string | null;
  summary: {
    unreadMessages: number;
    messagesLast7Days: number;
    upcomingMeetingsCount: number;
  };
  nextMeeting: {
    id: string;
    scheduledAt: string;
    title: string | null;
    location: string | null;
    meetingLink: string | null;
    meetingType: string;
  } | null;
  assignedTutor: {
    id: string;
    name: string;
    department: string;
  } | null;
  recentDocuments: Array<{
    id: string;
    label: string;
  }>;
  recentBlogPosts: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [dataLoading, setDataLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        const response = await axios.get("/api/students/me/dashboard");
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchDashboardData();
    }
  }, [isLoading, user]);

  const firstName = user?.name?.split(" ")[0] ?? "";
  const degreeProgram =
    dashboardData?.degreeProgram?.trim() ||
    "Program not set — ask your administrator";

  const recentDocuments = dashboardData?.recentDocuments || [];
  const recentBlogPosts = dashboardData?.recentBlogPosts || [];
  const nextMeeting = dashboardData?.nextMeeting;
  const assignedTutor = dashboardData?.assignedTutor;
  const summary = dashboardData?.summary;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f6fa", minHeight: "100vh" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          {isLoading ? (
            <>
              <Skeleton width={180} height={36} sx={{ mb: 0.3 }} />
              <Skeleton width={220} height={22} />
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.3 }}>
                Hi, {firstName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dataLoading ? (
                  <Skeleton width={200} component="span" />
                ) : (
                  degreeProgram
                )}
              </Typography>
            </>
          )}
        </Box>
        <Button
          variant="contained"
          href="/student/messages"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Contact Tutor
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Messages" icon={<MailOutlineIcon />}>
            {dataLoading ? (
              <Skeleton variant="rectangular" height={52} sx={{ mb: 1 }} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#1976d2", 0.06),
                    borderRadius: 2,
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "primary.main",
                  }}
                >
                  {summary?.unreadMessages ?? 0}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Unread in your inbox
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary?.messagesLast7Days ?? 0} messages involving you in the
                  last 7 days
                </Typography>
              </Box>
            )}
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Next Meeting" icon={<EventIcon />}>
            {dataLoading ? (
              <Skeleton variant="rectangular" height={40} />
            ) : nextMeeting ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {nextMeeting.title && (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {nextMeeting.title}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDateTime(nextMeeting.scheduledAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {nextMeeting.meetingType === "virtual"
                    ? "Virtual"
                    : "In person"}
                  {nextMeeting.location
                    ? ` · ${nextMeeting.location}`
                    : nextMeeting.meetingType === "virtual"
                      ? ""
                      : ""}
                </Typography>
                {nextMeeting.meetingType === "virtual" &&
                  nextMeeting.meetingLink && (
                    <MuiLink
                      href={nextMeeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="caption"
                      sx={{ wordBreak: "break-all" }}
                    >
                      Join link
                    </MuiLink>
                  )}
                {(summary?.upcomingMeetingsCount ?? 0) > 1 && (
                  <Typography variant="caption" color="text.secondary">
                    +{(summary?.upcomingMeetingsCount ?? 0) - 1} more scheduled
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming meetings
              </Typography>
            )}
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {dataLoading ? (
            <Skeleton
              variant="rectangular"
              height={150}
              sx={{ borderRadius: 2 }}
            />
          ) : assignedTutor ? (
            <AssignedTutorCard
              tutorName={assignedTutor.name}
              department={assignedTutor.department || "Tutor"}
              initials={assignedTutor.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")}
              onViewProfile={() => router.push("/student/messages")}
            />
          ) : (
            <Box
              sx={{
                bgcolor: "#f5f6fa",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No tutor assigned yet
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSection
            title="Recent Documents"
            viewAllHref="/student/documents"
          >
            {dataLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={48}
                    sx={{ mb: 1 }}
                  />
                ))}
              </>
            ) : recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <DocumentListItem key={doc.id} label={doc.label} />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 2 }}
              >
                No documents yet
              </Typography>
            )}
          </DashboardSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSection
            title="Recent blog posts"
            viewAllHref="/student/blog"
          >
            {dataLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={48}
                    sx={{ mb: 1 }}
                  />
                ))}
              </>
            ) : recentBlogPosts.length > 0 ? (
              recentBlogPosts.map((post) => (
                <DocumentListItem
                  key={post.id}
                  icon={<ArticleIcon sx={{ fontSize: 18 }} />}
                  label={`${post.title} · ${formatShortDate(post.createdAt)}`}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 2 }}
              >
                No blog posts yet
              </Typography>
            )}
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
}
