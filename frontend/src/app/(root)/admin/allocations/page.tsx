"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import AllocationStatsCard from "@/app/components/AllocationStatsCard";
import { AssignedStudentsTable } from "@/app/components/AssignedStudentsTable";
import { UnassignedStudentsTable } from "@/app/components/UnassignedStudentsTable";
import { AllocationDetailsDialog } from "@/app/components/AllocationDetailsDialog";
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
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { Allocation } from "@/app/hooks/allocations/query";

type TabStatus = "all" | "assigned" | "unassigned";

export default function AllocationPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tabStatus, setTabStatus] = useState<TabStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(
    null,
  );
  const [selectedAllocationForDetails, setSelectedAllocationForDetails] =
    useState<Allocation | null>(null);

  const { data: allocationsData, isLoading: allocationsLoading } =
    useAllocations(page, limit, tabStatus);
  const { data: statsData, isLoading: statsLoading } = useAllocationStats();

  const createAllocationMutation = useCreateAllocation();
  const bulkAllocateMutation = useBulkCreateAllocations();
  const updateAllocationMutation = useUpdateAllocation();
  const deleteAllocationMutation = useDeleteAllocation();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteAllocationId, setDeleteAllocationId] = useState<string | null>(
    null,
  );

  const handleOpenAllocationDialog = () => {
    setEditingAllocation(null);
    setBulkDialogOpen(true);
  };

  const handleShowDetails = (allocation: Allocation) => {
    setSelectedAllocationForDetails(allocation);
    setDetailsDialogOpen(true);
  };

  const handleDeleteAllocation = (allocationId: string) => {
    setDeleteAllocationId(allocationId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteAllocation = () => {
    if (deleteAllocationId) {
      deleteAllocationMutation.mutate(deleteAllocationId);
    }
    setConfirmDeleteOpen(false);
    setDeleteAllocationId(null);
  };

  const handleReallocateAllocation = (
    allocationId: string,
    newTutorId: string,
  ) => {
    updateAllocationMutation.mutate({
      id: allocationId,
      tutorId: newTutorId,
    });
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
              <Tab label="Unassigned Students" value="unassigned" />
              <Tab label="Assigned Students" value="assigned" />
            </Tabs>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAllocationDialog}
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                textTransform: "none",
                fontSize: "1rem",
                padding: "8px 24px",
              }}
            >
              New Allocation
            </Button>
          </Box>
          {/* Search */}
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Search..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "100%",
                maxWidth: "400px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "4px",
                },
              }}
            />
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
            {tabStatus === "unassigned" ? (
              <UnassignedStudentsTable
                data={allocationsData?.data || []}
                page={page}
                limit={limit}
                total={allocationsData?.pagination?.total || 0}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                onAssign={(studentId, tutorId) => {
                  createAllocationMutation.mutate({
                    studentId,
                    tutorId,
                  });
                }}
                isLoading={createAllocationMutation.isPending}
              />
            ) : (
              <AssignedStudentsTable
                data={allocationsData?.data || []}
                page={page}
                limit={limit}
                total={allocationsData?.pagination?.total || 0}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                onDetails={handleShowDetails}
              />
            )}
          </>
        )}
      </Stack>

      {/* Dialogs */}
      <AllocationDetailsDialog
        open={detailsDialogOpen}
        allocation={selectedAllocationForDetails}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedAllocationForDetails(null);
        }}
        onRemove={handleDeleteAllocation}
        onReallocate={handleReallocateAllocation}
        isLoading={
          deleteAllocationMutation.isPending ||
          updateAllocationMutation.isPending
        }
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Remove allocation"
        message="Are you sure you want to remove this allocation?"
        confirmLabel="Remove"
        confirmColor="error"
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDeleteAllocation}
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
