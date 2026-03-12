// components/AddStudentDialog.tsx
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

// form value type
export interface StudentFormValues {
  fullName: string;
  email: string;
  degreeProgram: string;
}

// validation schema
const studentSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  degreeProgram: yup.string().required("Degree program is required"),
});

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormValues) => void;
  /** initial values when editing */
  initialValues?: StudentFormValues;
  /** whether the dialog is for editing existing record */
  isEdit?: boolean;
}

export default function AddStudentDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
}: AddStudentDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: yupResolver(studentSchema),
    defaultValues: initialValues || {
      fullName: "",
      email: "",
      degreeProgram: "",
    },
  });

  // whenever initialValues change, reset the form
  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const handleFormSubmit = (data: StudentFormValues) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        {isEdit ? "Edit Student" : "Add New Student"}
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
                  placeholder="e.g. Oliver Smith"
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
                  placeholder="oliver@etutor.ac.uk"
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
            {isEdit ? "Save Changes" : "Create Student"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
