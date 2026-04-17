import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureClerkUserInSupabase } from "@/lib/auth/sync-user";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  console.log("🔍 UPLOAD DEBUG — userId:", userId);

  if (!userId) {
    console.error("❌ AUTH FAILED — userId is null");
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
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
    return NextResponse.json({ error: "Missing resume file" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    console.error("❌ FILE TYPE FAILED — got", file.type);
    return NextResponse.json(
      { error: "Only PDF resumes are supported" },
      { status: 400 }
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

  const supabase = createSupabaseAdminClient();
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
      { status: 500 }
    );
  }

  console.log("✅ UPLOAD SUCCESS — data:", data);

  // Save to database
  const { error: dbError } = await supabase.from("resumes").insert({
    user_id: userId,
    file_path: filePath,
    file_name: file.name,
  });

  if (dbError) {
    console.error("❌ DATABASE ERROR:", dbError);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  console.log("✅ DATABASE SAVED — userId:", userId);
  return NextResponse.json(
    {
      success: true,
      file_url: filePath,
      message: "Resume uploaded successfully",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
