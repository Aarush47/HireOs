import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

interface UpdateProfileBody {
  raw_cv?: string;
  parsed_skills?: string[];
  career_story?: string;
  target_roles?: string[];
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateProfileBody = await request.json();

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        raw_cv: body.raw_cv,
        parsed_skills: body.parsed_skills,
        career_story: body.career_story,
        target_roles: body.target_roles,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (err) {
    console.error("Profile update API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
