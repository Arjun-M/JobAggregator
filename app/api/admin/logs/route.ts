import { NextResponse } from "next/server";
import { readLogs, clearLogs } from "@/lib/logger";

export async function GET() {
  const content = readLogs();
  return NextResponse.json({ content });
}

export async function DELETE() {
  clearLogs();
  return NextResponse.json({ message: "Logs cleared" });
}
