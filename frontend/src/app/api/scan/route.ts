import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/scan/all`, {
      cache: "no-store",
    });
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get scans failed:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend", success: false, scans: [] },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Sending scan request to backend:", BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const text = await response.text();
    console.log("Backend response:", response.status, text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // If response is not JSON, wrap it
      data = { error: text || "Unknown error", status: response.status };
    }
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Initiate scan failed:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend", message: String(error) },
      { status: 503 }
    );
  }
}
