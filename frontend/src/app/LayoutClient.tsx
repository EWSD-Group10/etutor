"use client";

import { Box } from "@mui/material";
import { Sidebar } from "./components/Sidebar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <Box component="main" sx={{ marginLeft: "240px", minHeight: "100vh" }}>
        {children}
      </Box>
    </>
  );
}
