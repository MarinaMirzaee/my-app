"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/useAuth";
import AdminDashboard from "../../legacy-pages/AdminDashboard";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);
  if (!user || user.role !== "admin") return null;
  return <AdminDashboard />;
}
