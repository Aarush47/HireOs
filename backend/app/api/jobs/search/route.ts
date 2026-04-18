import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  created: string;
  redirect_url: string;
}

interface SearchRequest {
  keywords: string;
  location?: string;
  page?: number;
  results_per_page?: number;
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "developer";
    const location = searchParams.get("location") || "UK";

    console.log("🔍 JOB SEARCH (GET) — role:", role, "location:", location);

    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Adzuna credentials" },
        { status: 500, headers: corsHeaders }
      );
    }

    const adzunaUrl = new URL("https://api.adzuna.com/v1/api/jobs/gb/search/1");
    adzunaUrl.searchParams.append("app_id", appId);
    adzunaUrl.searchParams.append("app_key", apiKey);
    adzunaUrl.searchParams.append("what", role);
    adzunaUrl.searchParams.append("where", location);
    adzunaUrl.searchParams.append("results_per_page", "10");
    adzunaUrl.searchParams.append("page", "0");

    const adzunaResponse = await fetch(adzunaUrl.toString());

    if (!adzunaResponse.ok) {
      console.error("Adzuna API error:", adzunaResponse.statusText);
      return NextResponse.json(
        { error: "Failed to search jobs" },
        { status: 500, headers: corsHeaders }
      );
    }

    const adzunaData = await adzunaResponse.json();

    console.log(
      "✅ JOB SEARCH SUCCESS — found",
      adzunaData.results?.length || 0,
      "jobs"
    );

    const jobs = (adzunaData.results || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || "",
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_currency: job.salary_currency,
      created: job.created,
      apply_link: job.redirect_url,
    }));

    return NextResponse.json(
      {
        success: true,
        jobs,
        total: adzunaData.count || 0,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Job search error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body: SearchRequest = await request.json();
    const {
      keywords,
      location = "UK",
      page = 1,
      results_per_page = 10,
    } = body;

    if (!keywords) {
      return NextResponse.json(
        { error: "Keywords required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🔍 JOB SEARCH — keywords:", keywords, "location:", location);

    // Call Adzuna API
    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Adzuna credentials" },
        { status: 500, headers: corsHeaders }
      );
    }

    const adzunaUrl = new URL("https://api.adzuna.com/v1/api/jobs/gb/search/1");
    adzunaUrl.searchParams.append("app_id", appId);
    adzunaUrl.searchParams.append("app_key", apiKey);
    adzunaUrl.searchParams.append("what", keywords);
    adzunaUrl.searchParams.append("where", location);
    adzunaUrl.searchParams.append("results_per_page", results_per_page.toString());
    adzunaUrl.searchParams.append("page", (page - 1).toString());

    const adzunaResponse = await fetch(adzunaUrl.toString());

    if (!adzunaResponse.ok) {
      console.error("Adzuna API error:", adzunaResponse.statusText);
      return NextResponse.json(
        { error: "Failed to search jobs" },
        { status: 500, headers: corsHeaders }
      );
    }

    const adzunaData = await adzunaResponse.json();

    console.log(
      "✅ JOB SEARCH SUCCESS — found",
      adzunaData.results?.length || 0,
      "jobs"
    );

    const jobs = (adzunaData.results || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || "",
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_currency: job.salary_currency,
      created: job.created,
      redirect_url: job.redirect_url,
    }));

    return NextResponse.json(
      {
        success: true,
        jobs,
        total: adzunaData.count || 0,
        page,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Job search error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
