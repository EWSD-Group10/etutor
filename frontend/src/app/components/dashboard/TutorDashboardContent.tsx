"use client";

import React from "react";
import { Box, Typography, Grid, Stack, Skeleton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import MessageIcon from "@mui/icons-material/Message";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import DashboardStatsCard from "@/app/components/dashboard/DashboardStatsCard";
import DashboardSection from "@/app/components/dashboard/DashboardSection";
import StudentListItem from "@/app/components/dashboard/StudentListItem";
import ScheduleItem from "@/app/components/dashboard/ScheduleItem";
import MessageItem from "@/app/components/dashboard/MessageItem";

export interface TutorDashboardPayload {
  studentsCount: number;
  tuteesWithUnread: number;
  upcomingMeetingsCount: number;
  upcomingMeetings: Array<{
    id: string;
    time: string;
    date: string;
    location: string;
    subject: string;
  }>;
  unreadMessagesCount: number;
  recentMessages: Array<{
    id: string;
    sender: string;
    message: string;
    unreadCount: number;
  }>;
  tutees: Array<{
    id: string;
    name: string | null;
    email: string;
    degreeProgram: string | null;
    allocatedAt: string;
    unreadFromStudent: number;
  }>;
}

interface TutorDashboardContentProps {
  dashboardData: TutorDashboardPayload | null;
  dataLoading: boolean;
  headerLoading?: boolean;
  /** Logged-in tutor name, or viewed tutor name in preview. */
  displayName: string;
  previewMode?: boolean;
}

const TutorDashboardContent: React.FC<TutorDashboardContentProps> = ({
  dashboardData,
  dataLoading,
  headerLoading = false,
  displayName,
  previewMode = false,
}) => {
  const tutees = dashboardData?.tutees ?? [];
  const schedule = dashboardData?.upcomingMeetings || [];
  const messages = dashboardData?.recentMessages || [];
  const studentsCount = dashboardData?.studentsCount || 0;
  const upcomingMeetingsCount = dashboardData?.upcomingMeetingsCount || 0;
  const unreadMessagesCount = dashboardData?.unreadMessagesCount || 0;
  const tuteesWithUnread = dashboardData?.tuteesWithUnread ?? 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f6fa", minHeight: "100vh" }}>
      <Box sx={{ mb: 3 }}>
        {headerLoading ? (
          <Skeleton width={260} height={36} sx={{ mb: 0.5 }} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Welcome back, {displayName}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {previewMode
            ? "Preview of this tutor’s dashboard (read-only)."
            : "Here's what's happening with your students today."}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="My Students"
              value={studentsCount.toString()}
              icon={<PeopleIcon />}
              color="#1976d2"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="Upcoming Meetings"
              value={upcomingMeetingsCount.toString()}
              icon={<EventIcon />}
              color="#9c27b0"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="Unread Messages"
              value={unreadMessagesCount.toString()}
              icon={<MessageIcon />}
              color="#2e7d32"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="Tutees with unread"
              value={tuteesWithUnread.toString()}
              icon={<MarkChatUnreadIcon />}
              color="#ed6c02"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <DashboardSection
            title="My Students"
            viewAllHref={previewMode ? undefined : "/tutor/students"}
          >
            <Stack>
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
              ) : tutees.length > 0 ? (
                tutees.map((student) => (
                  <StudentListItem
                    key={student.id}
                    id={student.id}
                    name={student.name ?? ""}
                    email={student.email}
                    degreeProgram={student.degreeProgram}
                    unreadFromStudent={student.unreadFromStudent}
                    disableLink={previewMode}
                  />
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  No students assigned yet
                </Typography>
              )}
            </Stack>
          </DashboardSection>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <DashboardSection
            title="Upcoming meetings"
            viewAllHref={previewMode ? undefined : "/tutor/meetings"}
          >
            <Stack>
              {dataLoading ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={48}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </>
              ) : schedule.length > 0 ? (
                schedule.map((item) => (
                  <ScheduleItem
                    key={item.id}
                    id={item.id}
                    time={item.time}
                    date={item.date}
                    location={item.location}
                    subject={item.subject}
                  />
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  No upcoming meetings
                </Typography>
              )}
            </Stack>
          </DashboardSection>

          <DashboardSection
            title="Messages from students"
            viewAllHref={previewMode ? undefined : "/tutor/messages"}
          >
            <Stack>
              {dataLoading ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={48}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    id={message.id}
                    sender={message.sender}
                    message={message.message}
                    unreadCount={message.unreadCount}
                  />
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  No incoming messages from students yet
                </Typography>
              )}
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TutorDashboardContent;
