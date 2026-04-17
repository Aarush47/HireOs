import { useRef, useState } from "react";
import { FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { TonalityChat } from "@/components/onboarding/TonalityChat";

interface ParseResult {
  success: boolean;
  error?: string;
}

export function ResumeUploadPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("Upload your resume");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus("Uploading resume...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const backendURL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const res = await fetch(`${backendURL}/api/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data: ParseResult = await res.json();

      if (data.error) {
        setError(data.error);
        setStatus(`Error: ${data.error}`);
        return;
      }

      if (data.success) {
        setStatus(`✓ Resume uploaded successfully!`);
        setUploadSuccess(true);
        setTimeout(() => {
          setShowChat(true);
        }, 500);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setStatus("Upload failed");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (showChat) {
    return (
      <div className="w-full">
        <TonalityChat
          onComplete={() => {
            window.location.href = "/dashboard";
          }}
          backendUrl={
            import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ display: "none" }}
        />

        <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Resume (PDF)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click to browse or drag and drop your PDF resume
        </p>

        <button
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition"
        >
          {isLoading ? "Processing..." : "Select PDF"}
        </button>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted">
        {error ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-600">Success!</p>
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{status}</p>
        )}
      </div>
    </div>
  );
}
