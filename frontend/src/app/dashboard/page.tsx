"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getAllScans, getHealth } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, extractRepoName } from "@/lib/utils";
import { Scan, Shield, Bug, Wrench, ExternalLink, Plus, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30000,
  });

  const { data: scansData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["scans"],
    queryFn: getAllScans,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const scans = scansData?.scans || [];
  
  // Calculate stats
  const totalScans = scans.length;
  const activeScans = scans.filter(s => ["scanning", "analyzing", "applying_fixes", "running", "initiated"].includes(s.status?.toLowerCase())).length;
  const totalVulnerabilities = scans.reduce((acc, s) => acc + (s.totalFindings || s.results?.summary?.total || 0), 0);
  const totalFixes = scans.reduce((acc, s) => acc + (s.autoFixed || 0), 0);

  const stats = [
    { label: "Total Scans", value: totalScans, icon: Scan, color: "text-blue-400" },
    { label: "Active Scans", value: activeScans, icon: Shield, color: "text-yellow-400" },
    { label: "Vulnerabilities Found", value: totalVulnerabilities, icon: Bug, color: "text-red-400" },
    { label: "Fixes Generated", value: totalFixes, icon: Wrench, color: "text-green-400" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your security scans</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/scan">
              <Plus className="h-4 w-4 mr-2" />
              New Scan
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Scans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Your latest security scan results</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-4">Start your first security scan</p>
              <Button asChild>
                <Link href="/scan">
                  <Plus className="h-4 w-4 mr-2" />
                  New Scan
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Repository</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Branch</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Issues</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.slice(0, 10).map((scan) => (
                    <tr key={scan.scanId} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <span className="font-medium">{extractRepoName(scan.repoUrl || "Unknown")}</span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{scan.branch || "main"}</code>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={scan.status} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {scan.totalFindings || scan.results?.summary?.total || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {scan.createdAt ? formatDate(scan.createdAt) : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/scan/${scan.scanId}`}>
                              View
                            </Link>
                          </Button>
                          {scan.prUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={scan.prUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
