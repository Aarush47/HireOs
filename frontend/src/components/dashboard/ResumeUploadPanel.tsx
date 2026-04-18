import { useRef, useState } from "react";
import { FileUp, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { ResumeChat } from "@/components/onboarding/ResumeChat";

interface UploadResponse {
  success: boolean;
  file_url?: string;
  analysis?: {
    name: string;
    summary: string;
    key_skills?: string[];
  };
  error?: string;
}

export function ResumeUploadPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("Upload your resume");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [resumeText, setResumeText] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus("Uploading and parsing your resume...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const backendURL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const res = await fetch(`${backendURL}/api/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await res.json();

      if (data.error) {
        setError(data.error);
        setStatus(`Error: ${data.error}`);
        return;
      }

      if (data.success) {
        setStatus("✓ Resume uploaded! Opening chat...");
        // Store the resume text for the chat
        if (data.analysis?.summary) {
          setResumeText(
            `${file.name} - ${data.analysis.summary} - Skills: ${data.analysis.key_skills?.join(", ") || "various"}`
          );
        } else {
          setResumeText(file.name);
        }
        setTimeout(() => {
          setShowChat(true);
        }, 1000);
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
        <ResumeChat
          resumeText={resumeText}
          backendUrl={
            import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
          }
          onClose={() => {
            setShowChat(false);
            setStatus("Upload another resume");
            setResumeText("");
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        onClick={() => !isLoading && fileInputRef.current?.click()}
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
          Upload your resume to chat with Together AI about your career
        </p>

        <button
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-2 mx-auto"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Select PDF"
          )}
        </button>
      </div>

      {/* Status */}
      <div className="mt-6 p-4 rounded-lg bg-muted">
        {error ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-3">
            <Loader className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{status}</p>
        )}
      </div>
    </div>
  );
}
