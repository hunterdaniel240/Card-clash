"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    // Redirects to login page if there is no user stored in context.
    if (!loading && !user) {
      router.replace("/login"); // This is a redirect but stops user from clicking back
    }
  }, [user, loading, router]);
  // TODO create loading component
  if (loading || !user) return <p>Loading User</p>;

  return children;
}
