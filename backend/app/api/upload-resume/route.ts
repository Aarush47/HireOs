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

    console.log("[UPLOAD] userId:", userId);

    if (!userId) {
      console.error("[UPLOAD] No auth");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files supported" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("[UPLOAD] File:", file.name, "Size:", file.size);

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

    // TODO: Implement PDF text extraction with a Node.js-compatible library
    // For now, use a placeholder
    const extractedText = `Resume: ${file.name}`;

    const filePath = `${userId}/${Date.now()}-${file.name}`;
    console.log("[UPLOAD] Uploading to:", filePath);

    const { data, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[UPLOAD] Storage error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log("[UPLOAD] File stored successfully");

    // Save to database
    const { error: dbError } = await supabase.from("resumes").insert({
      user_id: userId,
      file_path: filePath,
      file_name: file.name,
      extracted_text: extractedText,
    });

    if (dbError) {
      console.error("[UPLOAD] DB error:", dbError);
    }

    // Update profile with raw_cv
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ raw_cv: extractedText, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (profileError) {
      console.error("[UPLOAD] Profile update error:", profileError);
    }

    console.log("[UPLOAD] Success");
    return NextResponse.json(
      {
        success: true,
        text: extractedText.substring(0, 500) + "...",
        length: extractedText.length,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[UPLOAD] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
