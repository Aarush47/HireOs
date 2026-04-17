import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { ensureClerkUserInSupabase } from "@/lib/auth/sync-user";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing resume file" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF resumes are supported" }, { status: 400 });
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
  const parser = new PDFParse({ data: bytes });
  const parsed = await parser.getText();
  await parser.destroy();
  const extractedText = parsed.text.trim();
  const filePath = `${userId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: dbError } = await supabase.from("resumes").insert({
    user_id: userId,
    file_url: filePath,
    extracted_text: extractedText,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ file_url: filePath, extracted_text: extractedText });
}
