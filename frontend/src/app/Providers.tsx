"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

function LastLoginToast() {
  const searchParams = useSearchParams();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    const lastLoginAt = searchParams.get("lastLoginAt");
    if (!lastLoginAt) return;

    hasShown.current = true;

    // Show toast immediately
    if (lastLoginAt === "first") {
      toast.success("Welcome! This is your first login.");
    } else {
      const lastLogin = new Date(lastLoginAt);
      toast.info(
        `Your last login was on ${lastLogin.toLocaleDateString()} at ${lastLogin.toLocaleTimeString()}`,
      );
    }

    // Clean the query param from the URL without a full reload
    window.history.replaceState(null, "", window.location.pathname);
  }, [searchParams]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ToastContainer position="bottom-right" autoClose={5000} />
        <Suspense>
          <LastLoginToast />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}
