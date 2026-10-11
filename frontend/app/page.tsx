"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getDefaultRouteForRole } from "@/lib/navigation";

export default function HomePage() {
  const router = useRouter();

  const { data: meData, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  useEffect(() => {
    if (meData?.data) {
      const target = getDefaultRouteForRole(meData.data.role);
      router.replace(target);
    }
  }, [meData, router]);

  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-body text-text-secondary">Routing to your workspace...</span>
      </div>
    </div>
  );
}
