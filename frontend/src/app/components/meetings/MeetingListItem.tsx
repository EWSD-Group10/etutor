"use client";

import React from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  alpha,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomIcon from "@mui/icons-material/Room";
import LinkIcon from "@mui/icons-material/Link";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type MeetingType = "in person" | "virtual";

interface MeetingListItemProps {
  id: string;
  title: string;
  date: {
    day: string;
    month: string;
  };
  time: string;
  duration: string;
  location: string;
  link?: string;
  participant: string;
  status: MeetingStatus;
  type: MeetingType;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  /** When true, only show View action (e.g. for student view). */
  viewOnly?: boolean;
}

const MeetingListItem: React.FC<MeetingListItemProps> = ({
  id,
  title,
  date,
  time,
  duration,
  location,
  link,
  participant,
  status,
  type,
  onView,
  onEdit,
  onComplete,
  onCancel,
  viewOnly = false,
}) => {
  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case "scheduled":
        return "#1976d2";
      case "completed":
        return "#2e7d32";
      case "cancelled":
        return "#d32f2f";
      default:
        return "grey";
    }
  };

  return (
    <Card
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 4,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)",
        border: "1px solid",
        borderColor: alpha("#000", 0.05),
        display: "flex",
        alignItems: "center",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
          transition: "boxShadow 0.3s ease-in-out",
        },
      }}
    >
      {/* Date Block */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: 3,
          bgcolor: alpha("#1976d2", 0.08),
          color: "#1976d2",
          flexShrink: 0,
          mr: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
          {date.day}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", mt: 0.2 }}>
          {date.month}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            {title}
          </Typography>
          <Chip
            label={type}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 600,
              bgcolor: alpha("#000", 0.04),
              color: "text.secondary",
              textTransform: "capitalize",
            }}
          />
        </Stack>

        <Stack direction="row" spacing={3} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.disabled" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {time} ({duration})
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            {type === "in person" ? (
              <RoomIcon sx={{ fontSize: 16, color: "text.disabled" }} />
            ) : (
              <LinkIcon sx={{ fontSize: 16, color: "text.disabled" }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: type === "virtual" ? "primary.main" : "text.secondary",
                fontWeight: 500,
                cursor: type === "virtual" ? "pointer" : "default",
                "&:hover": {
                  textDecoration: type === "virtual" ? "underline" : "none",
                },
              }}
            >
              {location}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <PersonOutlineIcon sx={{ fontSize: 16, color: "text.disabled" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {participant}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Status and Actions */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 2 }}>
        <Chip
          label={status}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.65rem",
            textTransform: "capitalize",
            bgcolor: alpha(getStatusColor(status), 0.08),
            color: getStatusColor(status),
            minWidth: 80,
          }}
        />

        <Stack direction="row" spacing={0.5}>
          {!viewOnly && status === "scheduled" && (
            <>
              <Tooltip title="Mark Complete">
                <IconButton size="small" onClick={() => onComplete?.(id)} sx={{ color: "success.main", "&:hover": { bgcolor: alpha("#2e7d32", 0.08) } }}>
                  <CheckCircleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel Meeting">
                <IconButton size="small" onClick={() => onCancel?.(id)} sx={{ color: "error.main", "&:hover": { bgcolor: alpha("#d32f2f", 0.08) } }}>
                  <CancelOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onView?.(id)} sx={{ color: "text.secondary" }}>
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {!viewOnly && (
            <>
              <Tooltip title="Edit Meeting">
                <IconButton size="small" onClick={() => onEdit?.(id)} sx={{ color: "text.secondary" }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default MeetingListItem;
