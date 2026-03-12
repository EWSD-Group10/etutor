import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export interface TutorFormValues {
  fullName: string;
  email: string;
  degreeProgram: string;
  department: string;
}

const tutorSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  degreeProgram: yup.string().required("Degree program is required"),
  department: yup.string().required("Department is required"),
});

interface AddTutorDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TutorFormValues) => void;
  initialValues?: TutorFormValues;
  isEdit?: boolean;
}

export default function AddTutorDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
}: AddTutorDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TutorFormValues>({
    resolver: yupResolver(tutorSchema),
    defaultValues: initialValues || {
      fullName: "",
      email: "",
      degreeProgram: "",
      department: "",
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const handleFormSubmit = (data: TutorFormValues) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        {isEdit ? "Edit Tutor" : "Add New Tutor"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  fullWidth
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  placeholder="sarah@etutor.ac.uk"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="degreeProgram"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Degree Program"
                  placeholder="Computer Science"
                  fullWidth
                  error={!!errors.degreeProgram}
                  helperText={errors.degreeProgram?.message}
                />
              )}
            />

            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department"
                  placeholder="Computer Science"
                  fullWidth
                  error={!!errors.department}
                  helperText={errors.department?.message}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              reset();
              onClose();
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {isEdit ? "Save Changes" : "Create Tutor"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
