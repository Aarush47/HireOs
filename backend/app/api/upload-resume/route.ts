import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureClerkUserInSupabase } from "@/lib/auth/sync-user";
import { supabaseAdmin } from "@/lib/supabase/admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    console.log("🔍 UPLOAD DEBUG — userId:", userId);

    if (!userId) {
      console.error("❌ AUTH FAILED — userId is null");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    console.log("📁 FILE DEBUG:", {
      exists: !!file,
      name: file instanceof File ? file.name : "NOT A FILE",
      type: file instanceof File ? file.type : "N/A",
      size: file instanceof File ? file.size : "N/A",
    });

    if (!(file instanceof File)) {
      console.error("❌ FILE FAILED — not a File instance");
      return NextResponse.json(
        { error: "Missing resume file" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (file.type !== "application/pdf") {
      console.error("❌ FILE TYPE FAILED — got", file.type);
      return NextResponse.json(
        { error: "Only PDF resumes are supported" },
        { status: 400, headers: corsHeaders }
      );
    }

    const user = await currentUser();
    await ensureClerkUserInSupabase({
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
      imageUrl: user?.imageUrl ?? null,
    });

    const supabase = supabaseAdmin;
    const bytes = Buffer.from(await file.arrayBuffer());

    const filePath = `${userId}/${Date.now()}-${file.name}`;
    console.log("📤 UPLOAD START — path:", filePath);

    const { data, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ UPLOAD ERROR:", {
        message: uploadError.message,
        status: uploadError.statusCode,
        details: uploadError,
      });
      return NextResponse.json(
        { error: uploadError.message, details: uploadError },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log("✅ UPLOAD SUCCESS — data:", data);

    // Extract text from PDF for resume_text field
    // For now, store the file path as text content
    const resumeText = `Resume: ${file.name}\nFile path: ${filePath}`;

    // Save to database
    const { error: dbError } = await supabase.from("resumes").insert({
      user_id: userId,
      file_url: filePath,
      file_name: file.name,
      file_size: file.size,
    });

    if (dbError) {
      console.error("❌ DATABASE ERROR:", dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update profile with resume_text
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ resume_text: resumeText, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (profileError) {
      console.error("❌ PROFILE UPDATE ERROR:", profileError);
    }

    console.log("✅ DATABASE SAVED — userId:", userId);
    return NextResponse.json(
      {
        success: true,
        file_url: filePath,
        message: "Resume uploaded successfully",
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ ENDPOINT ERROR:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
