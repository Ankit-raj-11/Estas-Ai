// Use Next.js API routes as proxy to avoid CORS issues
// The API routes forward requests to the backend
const API_BASE_URL = "";

// Types
export interface HealthStatus {
  status: string;
  version: string;
  services: {
    kestra: string;
    github: string;
    ai_engine: string;
  };
}

export interface ScanRequest {
  repoUrl: string;
  branch: string;
}

export interface ScanResponse {
  scanId: string;
  status: string;
  kestraExecutionId: string;
  message: string;
}

export interface Finding {
  id?: string;
  tool: string;
  file: string;
  line: number;
  severity: "low" | "medium" | "high" | "critical";
  rule: string;
  message: string;
  fixedCode?: string;
  status?: string;
}

export interface ScanStatus {
  scanId: string;
  repoUrl?: string;
  branch?: string;
  status: string;
  progress?: number;
  results?: {
    findings: Finding[];
    summary: {
      total: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  findings?: Finding[];
  totalFindings?: number;
  aiSummary?: string;
  riskScore?: number;
  autoFixed?: number;
  needsReview?: number;
  kestraExecutionId?: string;
  prUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface AllScansResponse {
  success: boolean;
  scans: ScanStatus[];
}

// API Functions
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => ({ message: "Request failed" }));
  
  // For health endpoint, return data even if status is not 2xx (degraded returns 503)
  if (endpoint === "/api/health") {
    return data as T;
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }

  return data as T;
}

export async function getHealth(): Promise<HealthStatus> {
  return fetchApi<HealthStatus>("/api/health");
}

export async function initiateScan(data: ScanRequest): Promise<ScanResponse> {
  return fetchApi<ScanResponse>("/api/scan", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getScanStatus(scanId: string): Promise<ScanStatus> {
  return fetchApi<ScanStatus>(`/api/scan/${scanId}`);
}

export async function getAllScans(): Promise<AllScansResponse> {
  // Uses /api/scan which maps to the GET handler that calls /api/scan/all on backend
  return fetchApi<AllScansResponse>("/api/scan");
}

export async function getScanFindings(scanId: string): Promise<{ findings: Finding[] }> {
  return fetchApi<{ findings: Finding[] }>(`/api/scan/${scanId}/findings`);
}

export async function getScanLogs(scanId: string): Promise<{ success: boolean; logs: any[] }> {
  return fetchApi<{ success: boolean; logs: any[] }>(`/api/scan/${scanId}/logs`);
}
