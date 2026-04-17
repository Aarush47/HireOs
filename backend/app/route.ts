import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "HireOS Backend API",
      endpoints: {
        upload_resume: "POST /api/upload-resume",
        tonality_start: "POST /api/tonality/start",
        tonality_respond: "POST /api/tonality/respond",
        tonality_analyze: "POST /api/tonality/analyze",
      },
    },
    { status: 200 }
  );
}
