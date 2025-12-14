"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileCode,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Shield,
} from "lucide-react";

interface FileStatus {
  path: string;
  status: "pending" | "scanning" | "completed" | "error";
  issues: number;
  fixed: number;
}

interface FileScannerProps {
  scanId: string;
  files?: FileStatus[];
  currentFile?: string;
  totalFiles?: number;
  scannedFiles?: number;
}

export function FileScanner({
  scanId,
  files = [],
  currentFile,
  totalFiles = 0,
  scannedFiles = 0,
}: FileScannerProps) {
  const progress = totalFiles > 0 ? (scannedFiles / totalFiles) * 100 : 0;

  const getStatusIcon = (status: FileStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "scanning":
        return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileCode className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: FileStatus["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-500/30 bg-green-500/5";
      case "scanning":
        return "border-yellow-500/30 bg-yellow-500/5";
      case "error":
        return "border-red-500/30 bg-red-500/5";
      default:
        return "border-border";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            File-by-File Scan Progress
          </CardTitle>
          <Badge variant="outline">
            {scannedFiles} / {totalFiles} files
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Scanning progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current File */}
        {currentFile && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
            <span className="text-sm font-mono truncate">{currentFile}</span>
            <Badge variant="secondary" className="ml-auto">
              Scanning...
            </Badge>
          </div>
        )}

        {/* File List */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded-lg border ${getStatusColor(
                  file.status
                )}`}
              >
                {getStatusIcon(file.status)}
                <span className="text-sm font-mono truncate flex-1">
                  {file.path}
                </span>
                {file.status === "completed" && (
                  <div className="flex items-center gap-2">
                    {file.issues > 0 ? (
                      <>
                        <Badge variant="destructive" className="text-xs">
                          {file.issues} issues
                        </Badge>
                        {file.fixed > 0 && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            {file.fixed} fixed
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Clean
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        {scannedFiles === totalFiles && totalFiles > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium">
              Scan complete! All {totalFiles} files have been analyzed.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
