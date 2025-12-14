import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      cache: "no-store",
    });
    
    // Parse response even if status is not 2xx (backend returns 503 for degraded)
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { 
        status: "unhealthy",
        version: "1.0.0",
        services: {
          kestra: "error",
          github: "error", 
          ai_engine: "error"
        },
        error: "Failed to connect to backend"
      },
      { status: 503 }
    );
  }
}
