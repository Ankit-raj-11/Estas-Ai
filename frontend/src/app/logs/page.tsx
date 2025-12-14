"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllScans, getScanStatus } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
  Terminal,
  Search,
  Copy,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const { data: scansData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["scans"],
    queryFn: getAllScans,
    refetchInterval: 10000,
  });

  const { data: selectedScan } = useQuery({
    queryKey: ["scan", selectedScanId],
    queryFn: () => getScanStatus(selectedScanId!),
    enabled: !!selectedScanId,
    refetchInterval: 5000,
  });

  const scans = scansData?.scans || [];
  const filteredScans = scans.filter(
    (scan) =>
      scan.scanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.repoUrl?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Generate log entries from scan data
  const generateLogEntries = (scan: typeof selectedScan) => {
    if (!scan) return [];
    
    const logs: { timestamp: string; level: string; message: string }[] = [];
    const baseTime = new Date(scan.createdAt || Date.now());
    
    logs.push({
      timestamp: baseTime.toISOString(),
      level: "INFO",
      message: `Scan initiated for ${scan.repoUrl || "repository"}`,
    });
    
    if (scan.status !== "initiated") {
      logs.push({
        timestamp: new Date(baseTime.getTime() + 2000).toISOString(),
        level: "INFO",
        message: `Cloning repository branch: ${scan.branch || "main"}`,
      });
    }
    
    if (["scanning", "analyzing", "analyzed", "completed", "failed"].includes(scan.status?.toLowerCase() || "")) {
      logs.push({
        timestamp: new Date(baseTime.getTime() + 5000).toISOString(),
        level: "INFO",
        message: "Running Semgrep security scanner...",
      });
      logs.push({
        timestamp: new Date(baseTime.getTime() + 8000).toISOString(),
        level: "INFO",
        message: "Running Bandit for Python files...",
      });
    }
    
    if (["analyzed", "completed", "failed"].includes(scan.status?.toLowerCase() || "")) {
      const total = scan.totalFindings || scan.results?.summary?.total || 0;
      logs.push({
        timestamp: new Date(baseTime.getTime() + 15000).toISOString(),
        level: total > 0 ? "WARN" : "INFO",
        message: `Scan complete. Found ${total} security issues.`,
      });
    }
    
    if (scan.status?.toLowerCase() === "completed") {
      logs.push({
        timestamp: new Date(baseTime.getTime() + 20000).toISOString(),
        level: "INFO",
        message: "AI fix generation completed",
      });
      if (scan.prUrl) {
        logs.push({
          timestamp: new Date(baseTime.getTime() + 25000).toISOString(),
          level: "INFO",
          message: `Pull request created: ${scan.prUrl}`,
        });
      }
    }
    
    if (scan.status?.toLowerCase() === "failed") {
      logs.push({
        timestamp: new Date(baseTime.getTime() + 20000).toISOString(),
        level: "ERROR",
        message: "Scan workflow failed. Check Kestra for details.",
      });
    }
    
    return logs;
  };

  const logEntries = generateLogEntries(selectedScan);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Logs & Executions</h1>
          <p className="text-muted-foreground">View scan execution logs and history</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scan List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Executions</CardTitle>
            <CardDescription>Select a scan to view logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or repo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No executions found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredScans.map((scan) => (
                  <button
                    key={scan.scanId}
                    onClick={() => setSelectedScanId(scan.scanId)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedScanId === scan.scanId
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-border hover:border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {scan.scanId}
                      </code>
                      <StatusBadge status={scan.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {scan.createdAt ? formatDate(scan.createdAt) : "Unknown"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Viewer */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Execution Logs
              </CardTitle>
              {selectedScanId && (
                <CardDescription className="flex items-center gap-2 mt-1">
                  <code className="text-xs">{selectedScanId}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1"
                    onClick={() => copyToClipboard(selectedScanId)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardDescription>
              )}
            </div>
            {selectedScanId && logEntries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(logEntries.map((l) => `[${l.timestamp}] ${l.level}: ${l.message}`).join("\n"))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedScanId ? (
              <div className="text-center py-16">
                <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No execution selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select an execution from the list to view its logs
                </p>
              </div>
            ) : (
              <div className="code-block font-mono text-sm space-y-1 max-h-[500px] overflow-y-auto">
                {logEntries.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`shrink-0 ${
                        log.level === "ERROR"
                          ? "text-red-400"
                          : log.level === "WARN"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    >
                      {log.level}:
                    </span>
                    <span className="text-foreground">{log.message}</span>
                  </div>
                ))}
                {selectedScan && (
                  <div className="flex items-center gap-2 pt-4 border-t border-border mt-4">
                    {selectedScan.status?.toLowerCase() === "completed" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">Execution completed successfully</span>
                      </>
                    ) : selectedScan.status?.toLowerCase() === "failed" ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-red-400">Execution failed</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
                        <span className="text-yellow-400">Execution in progress...</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
