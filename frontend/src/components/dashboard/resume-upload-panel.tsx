"use client";

import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

export function ResumeUploadPanel({ email }: { email: string | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) {
      setStatus("Choose a PDF first.");
      return;
    }

    setLoading(true);
    setStatus("Uploading...");
    setPreview("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        file_url?: string;
        extracted_text?: string;
      };

      if (!response.ok) {
        setStatus(payload.error ?? "Upload failed.");
        return;
      }

      setStatus(`RESUME UPLOADED ✓ ${payload.file_url ?? ""}`.trim());
      setPreview(payload.extracted_text ?? "");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "space-between" }}
      >
        <div>
          <p style={{ margin: 0, color: "#888", fontSize: 12 }}>{email ?? "Signed in"}</p>
          <h1 style={{ margin: "8px 0 0", fontSize: 28 }}>Dashboard</h1>
        </div>
        <UserButton />
      </div>

      <section
        style={{
          width: "100%",
          maxWidth: 720,
          border: "1px solid #222",
          borderRadius: 16,
          padding: 24,
          background: "#0a0a0a",
        }}
      >
        <p style={{ marginTop: 0, color: "#aaa" }}>
          Upload a PDF resume to store it in Supabase and extract text for AI processing.
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          style={{ display: "block", marginBottom: 16 }}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            background: "#fff",
            color: "#000",
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload resume"}
        </button>

        {status ? (
          <p style={{ marginTop: 16, color: status.includes("✓") ? "#00c896" : "#ff6b6b" }}>
            {status}
          </p>
        ) : null}
        {preview ? (
          <pre
            style={{
              marginTop: 16,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#111",
              border: "1px solid #222",
              borderRadius: 12,
              padding: 16,
              color: "#ccc",
              maxHeight: 320,
              overflow: "auto",
            }}
          >
            {preview}
          </pre>
        ) : null}
      </section>
    </main>
  );
}
