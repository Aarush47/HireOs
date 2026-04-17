import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { searchAdzuna, searchJSearch } from "@/lib/jobs";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = req.nextUrl.searchParams.get("role") || "software engineer";
  const location = req.nextUrl.searchParams.get("location") || "india";
  const [adzuna, jsearch] = await Promise.allSettled([
    searchAdzuna(role, location),
    searchJSearch(`${role} in ${location}`),
  ]);
  const results = [
    ...(adzuna.status === "fulfilled" ? adzuna.value : []),
    ...(jsearch.status === "fulfilled" ? jsearch.value : []),
  ];
  return NextResponse.json({ jobs: results });
}
