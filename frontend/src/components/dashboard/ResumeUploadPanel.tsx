import { useRef, useState } from "react";
import { FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@clerk/react";

interface ParseResult {
  success: boolean;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    target_role: string;
    years_experience: number;
    skills: string[];
    education: Array<{ degree: string; institution: string; year: string }>;
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      bullets: string[];
    }>;
  };
  error?: string;
}

export function ResumeUploadPanel() {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("Upload your resume");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult["profile"] | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus("Parsing resume with AI...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Get Clerk auth token
      const token = await getToken();

      // Connect to backend at localhost:3000 or deployed backend URL
      const backendURL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const res = await fetch(`${backendURL}/api/upload-resume`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Backend error response:", { status: res.status, body: errorData });
        setError(`Upload failed: ${res.status} ${res.statusText}`);
        setStatus(`Error: ${res.status}`);
        return;
      }

      const data: ParseResult = await res.json();

      if (data.error) {
        setError(data.error);
        setStatus(`Error: ${data.error}`);
        return;
      }

      if (data.success) {
<<<<<<< Updated upstream
        setResult(data.profile || null);
        setStatus(
          data.profile
            ? `✓ UPLOADED — ${data.message}`
            : `✓ Uploaded successfully`
        );
        console.log("Full profile:", data.profile);
=======
        setStatus(`✓ Resume uploaded successfully!`);
        setResult({
          full_name: "Upload complete",
          email: "",
          phone: "",
          location: "",
          target_role: "",
          years_experience: 0,
          skills: [],
          education: [],
          experience: [],
        });
        console.log("Upload successful:", data);
>>>>>>> Stashed changes
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);
      console.error("Backend URL:", import.meta.env.VITE_BACKEND_URL || "http://localhost:3000");
      setError(msg);
      setStatus("Upload failed - check console for details");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
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
        ) : result ? (
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

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          {/* Contact */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Contact Info</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{result.full_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{result.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{result.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{result.location}</p>
              </div>
            </div>
          </div>

          {/* Career Summary */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Career Summary</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Target Role</p>
                <p className="font-medium">{result.target_role}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Experience</p>
                <p className="font-medium">{result.years_experience} years</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {result.skills && result.skills.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-3">
                Skills ({result.skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {result.experience && result.experience.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-4">
                Experience ({result.experience.length})
              </h4>
              <div className="space-y-4">
                {result.experience.map((job, idx) => (
                  <div
                    key={idx}
                    className="border-l-2 border-primary/30 pl-4 pb-4"
                  >
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.company} • {job.duration}
                    </p>
                    {job.bullets && job.bullets.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {job.bullets.map((bullet, bidx) => (
                          <li key={bidx} className="text-sm text-foreground">
                            • {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {result.education && result.education.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-4">
                Education ({result.education.length})
              </h4>
              <div className="space-y-3">
                {result.education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution} • {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
