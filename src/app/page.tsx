"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/LoadingSpinner";

export default function Home() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push("/login");
      } else {
        const roleRoutes: Record<string, string> = {
          admin: "/admin",
          evaluator: "/evaluator",
          proposal_maker: "/proposal-maker",
          sales: "/sales",
        };
        router.push(roleRoutes[session.agent.role] || "/admin");
      }
    }
  }, [session, isLoading, router]);

  return <PageLoader />;
}
