import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "HireOS Backend API",
      version: "2.0 - Together AI",
      endpoints: {
        upload_resume: "POST /api/upload-resume - Upload PDF and get analysis via Together AI",
        profile: "GET /api/profile - Get user profile",
        profile_update: "POST /api/profile/update - Update user profile",
      },
    },
    { status: 200 }
  );
}

