"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { initiateScan } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Github, GitBranch, Loader2, Shield, AlertCircle } from "lucide-react";

export default function NewScanPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [errors, setErrors] = useState<{ repoUrl?: string; branch?: string }>({});

  const scanMutation = useMutation({
    mutationFn: initiateScan,
    onSuccess: (data) => {
      toast.success("Scan initiated successfully!", {
        description: `Scan ID: ${data.scanId}`,
      });
      router.push(`/scan/${data.scanId}`);
    },
    onError: (error: Error) => {
      toast.error("Failed to start scan", {
        description: error.message,
      });
    },
  });

  const validateForm = () => {
    const newErrors: { repoUrl?: string; branch?: string } = {};
    
    if (!repoUrl) {
      newErrors.repoUrl = "Repository URL is required";
    } else if (!repoUrl.match(/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/)) {
      newErrors.repoUrl = "Please enter a valid GitHub repository URL";
    }
    
    if (!branch) {
      newErrors.branch = "Branch name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      scanMutation.mutate({ repoUrl, branch });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">New Security Scan</h1>
        <p className="text-muted-foreground">
          Enter a GitHub repository URL to scan for security vulnerabilities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Scan Configuration
          </CardTitle>
          <CardDescription>
            The scan will analyze your code using Semgrep, Bandit, ESLint, and Gitleaks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Repository URL
              </label>
              <Input
                type="url"
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (errors.repoUrl) setErrors({ ...errors, repoUrl: undefined });
                }}
                className={errors.repoUrl ? "border-red-500" : ""}
              />
              {errors.repoUrl && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.repoUrl}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Example: https://github.com/your-username/your-repo
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Branch
              </label>
              <Input
                type="text"
                placeholder="main"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  if (errors.branch) setErrors({ ...errors, branch: undefined });
                }}
                className={errors.branch ? "border-red-500" : ""}
              />
              {errors.branch && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.branch}
                </p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium">What will be scanned:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Semgrep - Static analysis for security patterns</li>
                <li>• Bandit - Python security linter</li>
                <li>• ESLint - JavaScript/TypeScript security rules</li>
                <li>• Gitleaks - Secret detection</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={scanMutation.isPending}
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Scan...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-5 w-5" />
                  Start Security Scan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
