"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getScanStatus, getScanLogs } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { SeverityBadge } from "@/components/severity-badge";
import { CodeDiff } from "@/components/code-diff";
import { AIChat } from "@/components/ai-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { extractRepoName } from "@/lib/utils";
import {
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode,
  ArrowLeft,
  RefreshCw,
  Copy,
  Bot,
  Shield,
  Code,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

function TimelineStep({
  title,
  description,
  status,
  isLast = false,
}: {
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          status === "completed" ? "bg-green-500/20 text-green-400" :
          status === "active" ? "bg-yellow-500/20 text-yellow-400" :
          "bg-muted text-muted-foreground"
        }`}>
          {status === "completed" ? <CheckCircle2 className="h-5 w-5" /> :
           status === "active" ? <Clock className="h-5 w-5 animate-pulse" /> :
           <Clock className="h-5 w-5" />}
        </div>
        {!isLast && <div className={`w-0.5 h-12 ${status === "completed" ? "bg-green-500/50" : "bg-muted"}`} />}
      </div>
      <div className="pb-8">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function ScanDetailsPage() {
  const params = useParams();
  const scanId = params.scanId as string;

  const { data: scan, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => getScanStatus(scanId),
    refetchInterval: (query) => {
      const status = query.state.data?.status?.toLowerCase();
      if (status === "completed" || status === "failed") return false;
      return 5000;
    },
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["logs", scanId],
    queryFn: () => getScanLogs(scanId),
    enabled: !!scan?.kestraExecutionId,
    retry: 1,
    refetchInterval: (query) => {
      const status = scan?.status?.toLowerCase();
      if (status === "completed" || status === "failed") return false;
      return 10000;
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getTimelineStatus = (step: number) => {
    if (!scan) return "pending";
    const status = scan.status?.toLowerCase();
    const statusMap: Record<string, number> = {
      initiated: 1, scanning: 2, analyzing: 3, analyzed: 4,
      awaiting_approval: 4, applying_fixes: 5, completed: 6, failed: 0,
    };
    const currentStep = statusMap[status] || 0;
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Scan not found</h2>
        <p className="text-muted-foreground mb-4">The scan ID may be invalid or expired</p>
        <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  const findings = scan.findings || scan.results?.findings || [];
  
  // Get counts from progress or results
  const issuesFound = scan.progress?.issuesFound || scan.results?.issuesFound || 0;
  const issuesFixed = scan.progress?.issuesFixed || scan.results?.issuesFixed || 0;
  
  const summary = scan.results?.summary || {
    total: issuesFound,
    high: scan.results?.summary?.high || 0,
    medium: scan.results?.summary?.medium || 0,
    low: scan.results?.summary?.low || 0,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{extractRepoName(scan.repoUrl || "Unknown")}</h1>
            <StatusBadge status={scan.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><GitBranch className="h-4 w-4" />{scan.branch || "main"}</span>
            <span>Scan ID: {scanId}</span>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(scanId)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />Refresh
          </Button>
          {(scan.prUrl || scan.results?.prUrl) && (
            <Button size="sm" asChild>
              <a href={scan.prUrl || scan.results?.prUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />View PR
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{issuesFound}</div><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-400">{summary.high}</div><p className="text-sm text-muted-foreground">High</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-400">{summary.medium}</div><p className="text-sm text-muted-foreground">Medium</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-400">{summary.low}</div><p className="text-sm text-muted-foreground">Low</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-400">{issuesFixed}</div><p className="text-sm text-muted-foreground">Fixed</p></CardContent></Card>
      </div>

      <Tabs defaultValue="findings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="findings"><Shield className="h-4 w-4 mr-2" />Findings</TabsTrigger>
          <TabsTrigger value="fixes"><Code className="h-4 w-4 mr-2" />Changes</TabsTrigger>
          <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2" />AI Chat</TabsTrigger>
          <TabsTrigger value="progress"><Clock className="h-4 w-4 mr-2" />Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>Security Vulnerabilities</CardTitle>
              <CardDescription>Issues detected in your code</CardDescription>
            </CardHeader>
            <CardContent>
              {findings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No vulnerabilities found</h3>
                  <p className="text-sm text-muted-foreground">
                    {scan.status === "completed" ? "Your code passed all security checks!" : "Scan is still in progress..."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {findings.map((finding: { id?: string; file: string; line: number; tool: string; severity: string; message: string; rule: string }, index: number) => (
                    <div key={finding.id || index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm bg-muted px-2 py-1 rounded">{finding.file}:{finding.line}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{finding.tool}</Badge>
                          <SeverityBadge severity={finding.severity as "low" | "medium" | "high" | "critical"} />
                        </div>
                      </div>
                      <p className="text-sm">{finding.message}</p>
                      <p className="text-xs text-muted-foreground">Rule: {finding.rule}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixes">
          <div className="space-y-4">
            {findings.length === 0 ? (
              <Card><CardContent className="py-8 text-center">
                <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No code changes yet</h3>
                <p className="text-sm text-muted-foreground">Code changes will appear here once the AI generates fixes.</p>
              </CardContent></Card>
            ) : (
              findings.map((finding: { id?: string; file: string; severity: string; rule: string; message: string; fixedCode?: string }, index: number) => (
                <CodeDiff
                  key={finding.id || index}
                  filename={finding.file}
                  originalCode={`// Original code at ${finding.file}\n// Issue: ${finding.message}`}
                  fixedCode={finding.fixedCode || `// Fixed code\n// Security issue resolved`}
                  explanation={`Fixed ${finding.rule}: ${finding.message}`}
                  severity={finding.severity}
                  rule={finding.rule}
                  showActions={scan.status === "awaiting_approval"}
                  onApprove={() => toast.success(`Approved fix for ${finding.file}`)}
                  onReject={() => toast.info(`Rejected fix for ${finding.file}`)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <AIChat scanId={scanId} context={{ repoUrl: scan.repoUrl, findings: findings.map((f: { file: string; rule: string; severity: string; message: string; line?: number }) => ({ file: f.file, rule: f.rule, severity: f.severity, message: f.message, line: f.line })) }} />
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader><CardTitle>Scan Progress</CardTitle></CardHeader>
            <CardContent>
              <TimelineStep title="Repository Cloned" description="Code fetched from GitHub" status={getTimelineStatus(1) as "completed" | "active" | "pending"} />
              <TimelineStep title="Scanners Executed" description="Running security tools" status={getTimelineStatus(2) as "completed" | "active" | "pending"} />
              <TimelineStep title="Vulnerabilities Detected" description={`${issuesFound} issues found`} status={getTimelineStatus(3) as "completed" | "active" | "pending"} />
              <TimelineStep title="AI Fix Generated" description="Gemini generating fixes" status={getTimelineStatus(4) as "completed" | "active" | "pending"} />
              <TimelineStep title="PR Created" description="Changes pushed to GitHub" status={getTimelineStatus(5) as "completed" | "active" | "pending"} isLast />
            </CardContent>
          </Card>
          {scan.aiSummary && (
            <Card className="mt-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-purple-400" />AI Summary</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{scan.aiSummary}</p></CardContent>
            </Card>
          )}
          {scan.kestraExecutionId && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Execution Logs</CardTitle>
                <CardDescription>Real-time logs from the security scan workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Execution ID:</span>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{scan.kestraExecutionId}</code>
                  </div>
                  
                  {logsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Loading logs...</p>
                    </div>
                  ) : logsData?.success && logsData.logs && logsData.logs.length > 0 ? (
                    <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-1">
                      {logsData.logs
                        .filter((log: any) => log.level === "INFO" || log.level === "ERROR" || log.level === "WARN")
                        .slice(0, 100)
                        .map((log: any, index: number) => (
                          <div 
                            key={`${log.timestamp}-${index}`}
                            className="leading-relaxed"
                          >
                            <span className="text-gray-500 mr-2">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`font-semibold mr-2 ${
                              log.level === "ERROR" ? "text-red-400" : 
                              log.level === "WARN" ? "text-yellow-400" : 
                              "text-blue-400"
                            }`}>
                              [{log.level}]
                            </span>
                            <span className="text-gray-300">{log.message}</span>
                          </div>
                        ))}
                      {logsData.logs.filter((log: any) => log.level === "INFO" || log.level === "ERROR" || log.level === "WARN").length > 100 && (
                        <div className="text-center text-muted-foreground pt-2">
                          ... and {logsData.logs.filter((log: any) => log.level === "INFO" || log.level === "ERROR" || log.level === "WARN").length - 100} more logs
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No logs available yet</p>
                      <p className="text-xs mt-2">Logs will appear once the scan starts executing</p>
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a 
                      href={`http://localhost:8080/ui/executions/company.team/security-scan-flow/${scan.kestraExecutionId}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Logs in Kestra
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
