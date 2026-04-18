import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { useEffect, useState } from "react";
import { ResumeUploadPanel } from "@/components/dashboard/ResumeUploadPanel";

interface Profile {
  id: string;
  raw_cv?: string;
  parsed_skills?: string[];
  career_story?: string;
  target_roles?: string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  apply_link?: string;
}

interface MatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searching, setSearching] = useState(false);
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});
  const [matching, setMatching] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState<Record<string, string>>({});

  // Fetch profile on mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/auth" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!cvText.trim()) {
      alert("Please enter your resume text");
      return;
    }

    setParsing(true);
    try {
      // Parse CV
      const parseResponse = await fetch("/api/ai/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText }),
      });

      if (!parseResponse.ok) {
        throw new Error("Failed to parse CV");
      }

      const parseData = await parseResponse.json();
      const { parsed } = parseData;

      // Update profile
      const updateResponse = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_cv: cvText,
          parsed_skills: parsed.skills,
          career_story: parsed.career_story,
          target_roles: parsed.target_roles,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await updateResponse.json();
      setProfile(updatedProfile.profile);
      setCvText("");
      alert("Resume analyzed successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to analyze resume");
    } finally {
      setParsing(false);
    }
  };

  const handleFindJobs = async () => {
    if (!profile?.target_roles?.length) {
      alert("No target roles found. Please analyze your resume first.");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `/api/jobs/search?role=${encodeURIComponent(profile.target_roles[0])}`
      );

      if (!response.ok) {
        throw new Error("Failed to search jobs");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to find jobs");
    } finally {
      setSearching(false);
    }
  };

  const handleCheckMatch = async (job: Job) => {
    if (!profile) return;

    setMatching((prev) => ({ ...prev, [job.id]: true }));
    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          jd: job.description || job.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check match");
      }

      const data = await response.json();
      setMatchResults((prev) => ({ ...prev, [job.id]: data.result }));
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to check match");
    } finally {
      setMatching((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const handleGenerateCoverLetter = async (job: Job) => {
    if (!profile) return;

    setGenerating((prev) => ({ ...prev, [job.id]: true }));
    try {
      const response = await fetch("/api/ai/generate-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          job,
          type: "cover_letter",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data = await response.json();
      setGenerated((prev) => ({ ...prev, [job.id]: data.generated }));
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to generate cover letter");
    } finally {
      setGenerating((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex animate-spin">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.firstName}!
            </p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Resume Upload Section */}
        {!profile?.raw_cv ? (
          <div className="mb-8 bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Step 1: Upload Your Resume
            </h2>
            <div className="space-y-4">
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your resume/CV text here..."
                className="w-full min-h-48 p-4 border border-border rounded-lg bg-background text-foreground"
              />
              <button
                onClick={handleAnalyzeResume}
                disabled={parsing}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {parsing ? "Analyzing..." : "Analyze Resume"}
              </button>
            </div>
          </div>
        ) : null}

        {/* Profile Display */}
        {profile?.raw_cv ? (
          <div className="mb-8 bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Your Profile
            </h2>
            <div className="space-y-4">
              {profile.parsed_skills && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.parsed_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.career_story && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Career Story
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.career_story}
                  </p>
                </div>
              )}

              {profile.target_roles && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Target Roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.target_roles.map((role, i) => (
                      <span key={i} className="text-sm text-muted-foreground">
                        • {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setCvText(profile.raw_cv || "");
                  setProfile({ ...profile, raw_cv: undefined });
                }}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Edit Resume
              </button>
            </div>
          </div>
        ) : null}

        {/* Job Search Section */}
        {profile?.raw_cv ? (
          <div className="mb-8">
            <button
              onClick={handleFindJobs}
              disabled={searching}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {searching ? "Searching..." : "Find Jobs"}
            </button>
          </div>
        ) : null}

        {/* Jobs List */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Available Jobs
            </h2>
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-card border border-border rounded-lg p-6 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  {matchResults[job.id] && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {matchResults[job.id].score}%
                      </p>
                      <p className="text-xs text-muted-foreground">match</p>
                    </div>
                  )}
                </div>

                {/* Match Results */}
                {matchResults[job.id] && (
                  <div className="mb-4 space-y-2 bg-muted/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Strengths
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {matchResults[job.id].strengths.map((s, i) => (
                          <li key={i}>✓ {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Gaps
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {matchResults[job.id].gaps.map((g, i) => (
                          <li key={i}>• {g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Generated Content */}
                {generated[job.id] && (
                  <div className="mb-4 bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Generated Cover Letter
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {generated[job.id]}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {job.apply_link && (
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Apply
                    </a>
                  )}
                  <button
                    onClick={() => handleCheckMatch(job)}
                    disabled={matching[job.id]}
                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    {matching[job.id] ? "Checking..." : "Check Match"}
                  </button>
                  <button
                    onClick={() => handleGenerateCoverLetter(job)}
                    disabled={generating[job.id]}
                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    {generating[job.id] ? "Generating..." : "Generate Cover Letter"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Resume Upload Panel */}
        {!profile?.raw_cv ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Or Upload PDF Resume
            </h2>
            <ResumeUploadPanel />
          </div>
        ) : null}
      </main>
    </div>
  );
}
