// components/PageHeader.tsx
import type { ReactNode } from "react";
import { Box, Typography, Button, Stack, alpha } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  /** Right-side toolbar (e.g. search + sort) — sits beside title on desktop */
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  actions,
}: PageHeaderProps) {
  const showRight = Boolean(actions || buttonText);

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2.5,
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha("#000", 0.07),
        bgcolor: "#fff",
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "flex-end" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0, flex: showRight ? "1 1 auto" : undefined }}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.35}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {showRight && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="flex-end"
          sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" } }}
        >
          {actions}
          {buttonText && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onButtonClick}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              {buttonText}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}
