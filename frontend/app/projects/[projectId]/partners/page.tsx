"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PartnersAndFundingView } from "@/components/partners/partners-and-funding-view";

export default function ProjectPartnersAndFundingPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "";

  return <PartnersAndFundingView projectId={projectId} />;
}
