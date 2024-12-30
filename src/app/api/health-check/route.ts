import { type NextRequest } from "next/server";
import { db } from "~/server/db";

export async function GET(_req: NextRequest) {
  try {
    const result = await db.$queryRaw`SELECT NOW();`;
    
    return new Response(JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      query_result: result
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return new Response(
      JSON.stringify({ 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}