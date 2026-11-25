"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/useAuth";
export default function Layout({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user === null) router.replace("/signin"); }, [user, router]);
  if (!user) return null;
  return <DashboardLayout>{children}</DashboardLayout>;
}
