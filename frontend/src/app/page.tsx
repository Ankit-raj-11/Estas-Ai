import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Scan, Bot, GitPullRequest, Workflow, ArrowRight, Github, FileCode, Lock, Zap } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Multi-Tool Scanning",
    description: "Comprehensive security analysis using Semgrep, Bandit, ESLint, and Gitleaks",
  },
  {
    icon: Bot,
    title: "AI-Powered Fixes",
    description: "Google Gemini AI automatically generates secure code fixes for vulnerabilities",
  },
  {
    icon: GitPullRequest,
    title: "Automated PRs",
    description: "Security fixes are committed and pull requests created automatically",
  },
  {
    icon: Workflow,
    title: "Kestra Orchestration",
    description: "Reliable workflow orchestration ensures scans complete successfully",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Shield className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">AI-Powered Security</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Automated AI Security Scanner</span>
            <br />
            <span className="text-foreground">for GitHub</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Scan. Fix. Secure. Automatically.
            <br />
            Detect vulnerabilities and generate AI-powered fixes with a single click.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="glow-purple" asChild>
              <Link href="/scan">
                <Scan className="mr-2 h-5 w-5" />
                Start Scan
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">
                View Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estas-AI combines multiple security scanning tools with AI to automatically
              detect and fix vulnerabilities in your code.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card/50 border-border/50 hover:border-purple-500/30 transition-colors">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Architecture</h2>
            <p className="text-muted-foreground">End-to-end automated security pipeline</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {[
                { icon: Github, label: "GitHub Repo" },
                { icon: Scan, label: "Security Scan" },
                { icon: Bot, label: "AI Analysis" },
                { icon: FileCode, label: "Generate Fix" },
                { icon: GitPullRequest, label: "Create PR" },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mb-3">
                      <Icon className="h-8 w-8 text-purple-400" />
                    </div>
                    <span className="text-sm text-muted-foreground text-center">{step.label}</span>
                    {index < 4 && (
                      <ArrowRight className="hidden md:block absolute right-0 h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4 text-center">
          <Lock className="h-12 w-12 text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Code?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start scanning your repositories today and let AI handle the security fixes.
          </p>
          <Button size="lg" className="glow-purple" asChild>
            <Link href="/scan">
              <Zap className="mr-2 h-5 w-5" />
              Get Started
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <span className="font-semibold">Estas-AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-Powered Security Scanner for GitHub
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
