"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface CodeDiffProps {
  filename: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  severity: string;
  rule: string;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function CodeDiff({
  filename,
  originalCode,
  fixedCode,
  explanation,
  severity,
  rule,
  onApprove,
  onReject,
  showActions = true,
}: CodeDiffProps) {
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${label} copied to clipboard`);
  };

  const originalLines = originalCode.split("\n");
  const fixedLines = fixedCode.split("\n");

  // Generate diff highlighting
  const getDiffLines = () => {
    const maxLines = Math.max(originalLines.length, fixedLines.length);
    const diff = [];

    for (let i = 0; i < maxLines; i++) {
      const orig = originalLines[i] || "";
      const fixed = fixedLines[i] || "";
      
      if (orig !== fixed) {
        diff.push({
          lineNum: i + 1,
          original: orig,
          fixed: fixed,
          type: !orig ? "added" : !fixed ? "removed" : "changed",
        });
      } else {
        diff.push({
          lineNum: i + 1,
          original: orig,
          fixed: fixed,
          type: "unchanged",
        });
      }
    }
    return diff;
  };

  const diffLines = getDiffLines();
  const changedCount = diffLines.filter((l) => l.type !== "unchanged").length;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm font-mono">{filename}</CardTitle>
            <Badge
              variant={
                severity === "high" || severity === "critical"
                  ? "destructive"
                  : severity === "medium"
                  ? "default"
                  : "secondary"
              }
            >
              {severity}
            </Badge>
            <Badge variant="outline">{rule}</Badge>
            <span className="text-xs text-muted-foreground">
              {changedCount} line{changedCount !== 1 ? "s" : ""} changed
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Explanation */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-1">Why this change?</h4>
            <p className="text-sm text-muted-foreground">{explanation}</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "split" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("split")}
            >
              Split View
            </Button>
            <Button
              variant={viewMode === "unified" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("unified")}
            >
              Unified View
            </Button>
          </div>

          {/* Code Diff */}
          {viewMode === "split" ? (
            <div className="grid grid-cols-2 gap-2">
              {/* Original */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-400">
                    Original
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6"
                    onClick={() => copyCode(originalCode, "Original code")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <pre className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 text-xs overflow-x-auto max-h-96">
                  <code>
                    {diffLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`${
                          line.type === "removed" || line.type === "changed"
                            ? "bg-red-900/30 text-red-300"
                            : ""
                        }`}
                      >
                        <span className="text-muted-foreground mr-3 select-none">
                          {line.lineNum.toString().padStart(3)}
                        </span>
                        {line.original}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>

              {/* Fixed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-400">
                    Fixed
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6"
                    onClick={() => copyCode(fixedCode, "Fixed code")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <pre className="bg-green-950/20 border border-green-900/30 rounded-lg p-3 text-xs overflow-x-auto max-h-96">
                  <code>
                    {diffLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`${
                          line.type === "added" || line.type === "changed"
                            ? "bg-green-900/30 text-green-300"
                            : ""
                        }`}
                      >
                        <span className="text-muted-foreground mr-3 select-none">
                          {line.lineNum.toString().padStart(3)}
                        </span>
                        {line.fixed}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          ) : (
            /* Unified View */
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Unified Diff</span>
              </div>
              <pre className="bg-muted/30 border rounded-lg p-3 text-xs overflow-x-auto max-h-96">
                <code>
                  {diffLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`${
                        line.type === "removed"
                          ? "bg-red-900/30 text-red-300"
                          : line.type === "added"
                          ? "bg-green-900/30 text-green-300"
                          : line.type === "changed"
                          ? "bg-yellow-900/20"
                          : ""
                      }`}
                    >
                      <span className="text-muted-foreground mr-2 select-none">
                        {line.type === "removed"
                          ? "-"
                          : line.type === "added"
                          ? "+"
                          : " "}
                      </span>
                      <span className="text-muted-foreground mr-3 select-none">
                        {line.lineNum.toString().padStart(3)}
                      </span>
                      {line.type === "changed" ? (
                        <>
                          <span className="line-through text-red-400">
                            {line.original}
                          </span>
                          <span className="text-green-400 ml-2">
                            → {line.fixed}
                          </span>
                        </>
                      ) : line.type === "removed" ? (
                        line.original
                      ) : (
                        line.fixed || line.original
                      )}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={onApprove}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve Fix
              </Button>
              <Button variant="outline" size="sm" onClick={onReject}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
