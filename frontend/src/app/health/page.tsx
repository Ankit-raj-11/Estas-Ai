"use client";

import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Server,
  Workflow,
  Github,
  Bot,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ServiceStatus {
  name: string;
  icon: React.ElementType;
  status: string;
  description: string;
}

function StatusIndicator({ status }: { status: string }) {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "connected" || statusLower === "authenticated" || statusLower === "operational" || statusLower === "healthy") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <span className="text-green-400 font-medium">Operational</span>
      </div>
    );
  }
  
  if (statusLower === "degraded" || statusLower === "warning") {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-400" />
        <span className="text-yellow-400 font-medium">Degraded</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <XCircle className="h-5 w-5 text-red-400" />
      <span className="text-red-400 font-medium">Offline</span>
    </div>
  );
}

export default function HealthPage() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
  });

  const services: ServiceStatus[] = data
    ? [
        {
          name: "Backend Server",
          icon: Server,
          status: data.status,
          description: `Version ${data.version}`,
        },
        {
          name: "Kestra Orchestration",
          icon: Workflow,
          status: data.services?.kestra || "unknown",
          description: "Workflow engine",
        },
        {
          name: "GitHub Integration",
          icon: Github,
          status: data.services?.github || "unknown",
          description: "Repository access",
        },
        {
          name: "AI Engine",
          icon: Bot,
          status: data.services?.ai_engine || "unknown",
          description: "Google Gemini",
        },
      ]
    : [];

  const allHealthy = services.every(
    (s) =>
      s.status.toLowerCase() === "connected" ||
      s.status.toLowerCase() === "authenticated" ||
      s.status.toLowerCase() === "operational" ||
      s.status.toLowerCase() === "healthy"
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor service status and connectivity</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Overall Status</h2>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Checking services..."
                  : error
                  ? "Unable to connect to backend"
                  : allHealthy
                  ? "All systems operational"
                  : "Some services may be degraded"}
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : error ? (
              <div className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-400" />
                <span className="text-red-400 font-semibold">Offline</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {allHealthy ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                    <span className="text-green-400 font-semibold">Healthy</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">Degraded</span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
              <p className="text-muted-foreground mb-4">
                Unable to connect to the backend server. Make sure it&apos;s running.
              </p>
              <code className="text-sm bg-muted px-3 py-2 rounded block max-w-md mx-auto">
                cd backend && npm run dev
              </code>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <StatusIndicator status={service.status} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Connection Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Connection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend URL</span>
              <code className="bg-muted px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Health Endpoint</span>
              <code className="bg-muted px-2 py-1 rounded">/api/health</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
