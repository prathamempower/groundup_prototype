"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getDefaultRouteForRole } from "@/lib/navigation";

import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const router = useRouter();

  const { data: meData, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  useEffect(() => {
    router.replace("/projects");
  }, [router]);

  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
