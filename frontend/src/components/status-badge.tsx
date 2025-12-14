"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "info" | "secondary"; label: string }> = {
    initiated: { variant: "info", label: "Initiated" },
    scanning: { variant: "warning", label: "Scanning" },
    analyzing: { variant: "warning", label: "Analyzing" },
    analyzed: { variant: "info", label: "Analyzed" },
    awaiting_approval: { variant: "warning", label: "Awaiting Approval" },
    applying_fixes: { variant: "warning", label: "Applying Fixes" },
    completed: { variant: "success", label: "Completed" },
    failed: { variant: "danger", label: "Failed" },
    running: { variant: "warning", label: "Running" },
    success: { variant: "success", label: "Success" },
    queued: { variant: "secondary", label: "Queued" },
  };

  const config = statusConfig[status.toLowerCase()] || { variant: "secondary" as const, label: status };
  const isLoading = ["scanning", "analyzing", "applying_fixes", "running"].includes(status.toLowerCase());

  return (
    <Badge variant={config.variant} className="gap-1">
      {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
      {config.label}
    </Badge>
  );
}
