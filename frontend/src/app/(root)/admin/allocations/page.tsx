"use client";

import React, { useState } from "react";
import { Box, Stack, Tabs, Tab, CircularProgress, Alert } from "@mui/material";
import AllocationStatsCard from "@/app/components/AllocationStatsCard";
import { AllocationTable } from "@/app/components/AllocationTable";
import { SingleAllocationDialog } from "@/app/components/SingleAllocationDialog";
import { BulkAllocationDialog } from "@/app/components/BulkAllocationDialog";
import {
  useAllocations,
  useAllocationStats,
} from "@/app/hooks/allocations/useAllocations";
import {
  useCreateAllocation,
  useBulkCreateAllocations,
  useUpdateAllocation,
  useDeleteAllocation,
} from "@/app/hooks/allocations/useAllocationsMutations";
import {
  People as PeopleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { Allocation } from "@/app/hooks/allocations/query";

type TabStatus = "all" | "assigned" | "unassigned";

export default function AllocationPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tabStatus, setTabStatus] = useState<TabStatus>("all");
  const [singleDialogOpen, setSingleDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(
    null,
  );

  const { data: allocationsData, isLoading: allocationsLoading } =
    useAllocations(page, limit, tabStatus);
  const { data: statsData, isLoading: statsLoading } = useAllocationStats();

  const createAllocationMutation = useCreateAllocation();
  const bulkAllocateMutation = useBulkCreateAllocations();
  const updateAllocationMutation = useUpdateAllocation();
  const deleteAllocationMutation = useDeleteAllocation();

  const handleOpenSingleDialog = () => {
    setEditingAllocation(null);
    setSingleDialogOpen(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkDialogOpen(true);
  };

  const handleEditAllocation = (allocation: Allocation) => {
    setEditingAllocation(allocation);
    setSingleDialogOpen(true);
  };

  const handleDeleteAllocation = (allocationId: string) => {
    if (confirm("Are you sure you want to remove this allocation?")) {
      deleteAllocationMutation.mutate(allocationId);
    }
  };

  const handleSubmitSingleAllocation = (data: {
    tutorId: string;
    studentId: string;
    reason?: string;
    notes?: string;
  }) => {
    if (editingAllocation) {
      updateAllocationMutation.mutate({
        id: editingAllocation.id,
        tutorId: data.tutorId,
        reason: data.reason,
        notes: data.notes,
      });
    } else {
      createAllocationMutation.mutate(data);
    }
    setSingleDialogOpen(false);
  };

  const handleSubmitBulkAllocation = (data: {
    tutorId: string;
    studentIds: string[];
    reason?: string;
    notes?: string;
  }) => {
    bulkAllocateMutation.mutate(data);
    setBulkDialogOpen(false);
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: TabStatus,
  ) => {
    setTabStatus(newValue);
    setPage(1);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1400px", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <h1 style={{ margin: "0 0 8px 0" }}>Tutor Allocation</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Manage student-tutor assignments
          </p>
        </Box>

        {/* Stats Cards */}
        <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
          <AllocationStatsCard
            label="Total Allocations"
            value={statsData?.totalAllocations || 0}
            icon={<PeopleIcon />}
            isLoading={statsLoading}
          />
          <AllocationStatsCard
            label="Unassigned Students"
            value={statsData?.unassignedStudents || 0}
            icon={<PersonIcon />}
            isLoading={statsLoading}
          />
          <AllocationStatsCard
            label="Active Tutors"
            value={statsData?.activeTutors || 0}
            icon={<SchoolIcon />}
            isLoading={statsLoading}
          />
          <AllocationStatsCard
            label="Avg Students/Tutor"
            value={statsData?.avgStudentsPerTutor?.toFixed(1) || 0}
            icon={<BarChartIcon />}
            isLoading={statsLoading}
          />
        </Stack>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Tabs
              value={tabStatus}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "1rem",
                },
              }}
            >
              <Tab label="All Allocations" value="all" />
              <Tab label="Assigned Students" value="assigned" />
              <Tab label="Unassigned Students" value="unassigned" />
            </Tabs>
            <Box sx={{ display: "flex", gap: 1 }}>
              <button
                onClick={handleOpenSingleDialog}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Single Allocation
              </button>
              <button
                onClick={handleOpenBulkDialog}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#388e3c",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Bulk Allocation
              </button>
            </Box>
          </Box>
        </Box>

        {/* Loading State */}
        {allocationsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Error State */}
            {createAllocationMutation.isError && (
              <Alert severity="error">
                {(createAllocationMutation.error as Error).message ||
                  "Failed to create allocation"}
              </Alert>
            )}
            {bulkAllocateMutation.isError && (
              <Alert severity="error">
                {(bulkAllocateMutation.error as Error).message ||
                  "Failed to bulk allocate"}
              </Alert>
            )}
            {deleteAllocationMutation.isError && (
              <Alert severity="error">
                {(deleteAllocationMutation.error as Error).message ||
                  "Failed to delete allocation"}
              </Alert>
            )}

            {/* Success Messages */}
            {createAllocationMutation.isSuccess && (
              <Alert severity="success">Allocation created successfully!</Alert>
            )}
            {bulkAllocateMutation.isSuccess && (
              <Alert severity="success">
                Bulk allocation completed successfully!
              </Alert>
            )}
            {deleteAllocationMutation.isSuccess && (
              <Alert severity="success">Allocation removed successfully!</Alert>
            )}

            {/* Allocation Table */}
            <AllocationTable
              data={allocationsData?.data || []}
              page={page}
              limit={limit}
              total={allocationsData?.pagination?.total || 0}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              onEdit={handleEditAllocation}
              onDelete={handleDeleteAllocation}
              onAdd={handleOpenSingleDialog}
            />
          </>
        )}
      </Stack>

      {/* Dialogs */}
      <SingleAllocationDialog
        open={singleDialogOpen}
        onClose={() => {
          setSingleDialogOpen(false);
          setEditingAllocation(null);
        }}
        onSubmit={handleSubmitSingleAllocation}
        isLoading={
          createAllocationMutation.isPending ||
          updateAllocationMutation.isPending
        }
        editingAllocation={editingAllocation}
      />

      <BulkAllocationDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onSubmit={handleSubmitBulkAllocation}
        isLoading={bulkAllocateMutation.isPending}
      />
    </Box>
  );
}
