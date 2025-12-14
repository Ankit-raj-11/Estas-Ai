import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { scanId } = await params;
    
    const response = await fetch(`${BACKEND_URL}/api/scan/${scanId}`, {
      cache: "no-store",
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get scan status failed:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend", message: String(error) },
      { status: 503 }
    );
  }
}
