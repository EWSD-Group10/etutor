// components/PageHeader.tsx
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        px: 4,
        py: 3,
        borderRadius: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {buttonText && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
}
