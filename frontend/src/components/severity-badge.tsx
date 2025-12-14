"use client";

import { Badge } from "@/components/ui/badge";

interface SeverityBadgeProps {
  severity: string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const severityConfig: Record<string, { variant: "danger" | "warning" | "info" | "secondary"; label: string }> = {
    critical: { variant: "danger", label: "Critical" },
    high: { variant: "danger", label: "High" },
    medium: { variant: "warning", label: "Medium" },
    low: { variant: "info", label: "Low" },
  };

  const config = severityConfig[severity.toLowerCase()] || { variant: "secondary" as const, label: severity };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
