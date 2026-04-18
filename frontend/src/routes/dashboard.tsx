import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { useEffect, useState } from "react";
import { ResumeUploadPanel } from "@/components/dashboard/ResumeUploadPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Search, Sparkles } from "lucide-react";

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
  description: string;
  companyEmail: string;
  logoLabel: string;
  requiredSkills: string[];
  score: number;
}

interface ResumeUploadPayload {
  rawCv: string;
  parsedSkills: string[];
  careerStory: string;
  targetRoles: string[];
}

const COMPANY_TEMPLATES: Omit<Job, "id" | "score">[] = [
  {
    title: "Frontend Engineer",
    company: "Zoho",
    location: "Bengaluru, India",
    description:
      "Build scalable product interfaces with React and TypeScript for business SaaS products used across India.",
    companyEmail: "careers@zoho.com",
    logoLabel: "Z",
    requiredSkills: ["react", "typescript", "ui", "frontend", "javascript"],
  },
  {
    title: "Software Engineer",
    company: "Freshworks",
    location: "Chennai, India",
    description:
      "Develop product services and APIs with strong engineering fundamentals and customer-centric execution.",
    companyEmail: "careers@freshworks.com",
    logoLabel: "FW",
    requiredSkills: ["python", "api", "backend", "system design", "algorithms"],
  },
  {
    title: "Data Analyst",
    company: "Naukri (Info Edge)",
    location: "Noida, India",
    description:
      "Transform user and platform data into hiring insights, growth opportunities, and measurable improvements.",
    companyEmail: "careers@infoedge.in",
    logoLabel: "N",
    requiredSkills: ["sql", "analytics", "data", "dashboard", "excel"],
  },
  {
    title: "Product Analyst",
    company: "Razorpay",
    location: "Bengaluru, India",
    description:
      "Partner with product and growth teams to evaluate experiments and shape data-backed roadmap decisions.",
    companyEmail: "careers@razorpay.com",
    logoLabel: "R",
    requiredSkills: ["sql", "product", "experiments", "communication", "analytics"],
  },
  {
    title: "Full Stack Engineer",
    company: "PhonePe",
    location: "Bengaluru, India",
    description:
      "Ship user-focused features across frontend and backend for secure and high-scale payments infrastructure.",
    companyEmail: "careers@phonepe.com",
    logoLabel: "PP",
    requiredSkills: ["react", "node", "api", "typescript", "backend"],
  },
  {
    title: "Product Manager",
    company: "Swiggy",
    location: "Bengaluru, India",
    description:
      "Lead cross-functional product execution, define strategy, and drive customer outcomes for marketplace products.",
    companyEmail: "careers@swiggy.in",
    logoLabel: "SW",
    requiredSkills: ["product", "strategy", "stakeholder", "communication", "roadmap"],
  },
  {
    title: "Backend Engineer",
    company: "CRED",
    location: "Bengaluru, India",
    description:
      "Build and optimize backend services for reliable fintech user journeys and high-throughput transaction systems.",
    companyEmail: "careers@cred.club",
    logoLabel: "CR",
    requiredSkills: ["backend", "api", "python", "node", "sql"],
  },
];

function randomAiDelay() {
  const waitMs = 1000 + Math.floor(Math.random() * 1001);
  return new Promise((resolve) => setTimeout(resolve, waitMs));
}

function normalizeSkills(profile: Profile) {
  const fromParsed = profile.parsed_skills ?? [];
  const fromRawCv = (profile.raw_cv ?? "")
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((word) => word.length > 2);

  return new Set([
    ...fromParsed.map((skill) => skill.toLowerCase()),
    ...fromRawCv,
  ]);
}

function scoreJob(skillSet: Set<string>, template: Omit<Job, "id" | "score">) {
  const overlap = template.requiredSkills.filter((skill) => skillSet.has(skill));
  const overlapRatio = overlap.length / template.requiredSkills.length;
  const baseScore = 58 + Math.round(overlapRatio * 34);
  const variation = Math.floor(Math.random() * 7);
  const score = Math.min(97, baseScore + variation);

  return { score, overlap };
}

function generateMockJobs(profile: Profile) {
  const skillSet = normalizeSkills(profile);

  const ranked = COMPANY_TEMPLATES.map((template) => {
    const { score, overlap } = scoreJob(skillSet, template);
    return {
      ...template,
      id: `${template.company}-${template.title}`.toLowerCase().replace(/\s+/g, "-"),
      score,
      overlap,
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ overlap, ...job }) => ({
      ...job,
      requiredSkills: overlap.length > 0 ? overlap : job.requiredSkills.slice(0, 2),
    }));

  return ranked;
}

function generateCoverLetter(profile: Profile, job: Job) {
  const skills = (profile.parsed_skills ?? []).slice(0, 4).join(", ");
  const profileSummary =
    profile.career_story ||
    "I build reliable products by combining technical depth with clear business communication.";

  return `Subject: Application for ${job.title} - ${job.company}\n\nDear Hiring Team at ${job.company},\n\nI am excited to apply for the ${job.title} role. My resume reflects direct alignment with your needs in ${job.requiredSkills.join(", ")}.\n\n${profileSummary}\n\nIn recent work, I have focused on practical impact: improving delivery speed, maintaining high quality standards, and collaborating effectively with cross-functional teams. These strengths map well to the expectations of this position in ${job.location}.\n\nCore strengths I would bring to your team include ${skills || "problem solving, ownership, and communication"}. I am especially motivated by ${job.company}'s emphasis on building meaningful, scalable products.\n\nThank you for your time and consideration. I would value the opportunity to discuss how I can contribute to your team.\n\nSincerely,\n${profile.id}`;
}

function MatchPie({ score }: { score: number }) {
  const size = 56;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-14 w-14">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/60"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-primary"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (score / 100) * circumference,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
        {score}%
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const apiBase = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [chatComplete, setChatComplete] = useState(false);

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
      const response = await fetch(`${apiBase}/api/profile`);
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
      const parseResponse = await fetch(`${apiBase}/api/ai/parse-cv`, {
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
      const updateResponse = await fetch(`${apiBase}/api/profile/update`, {
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
    if (!profile?.raw_cv) {
      alert("Please upload or analyze your resume first.");
      return;
    }

    setSearching(true);
    try {
      await randomAiDelay();
      setJobs(generateMockJobs(profile));
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to find jobs");
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateCoverLetter = async (job: Job) => {
    if (!profile) return;

    setGenerating((prev) => ({ ...prev, [job.id]: true }));
    try {
      await randomAiDelay();
      setGenerated((prev) => ({ ...prev, [job.id]: generateCoverLetter(profile, job) }));
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to generate cover letter");
    } finally {
      setGenerating((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const handleSendWithGmail = async (job: Job) => {
    if (!generated[job.id]) return;

    setSending((prev) => ({ ...prev, [job.id]: true }));
    try {
      await randomAiDelay();
      const composeUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(job.companyEmail)}` +
        `&su=${encodeURIComponent(`Application for ${job.title}`)}` +
        `&body=${encodeURIComponent(generated[job.id])}`;

      window.open(composeUrl, "_blank", "noopener,noreferrer");
    } finally {
      setSending((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const handleResumeAnalyzed = async (payload: ResumeUploadPayload) => {
    setProfile((prev) => ({
      id: prev?.id ?? user?.id ?? "candidate",
      ...prev,
      raw_cv: payload.rawCv,
      parsed_skills: payload.parsedSkills,
      career_story: payload.careerStory,
      target_roles: payload.targetRoles,
    }));

    try {
      const updateResponse = await fetch(`${apiBase}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_cv: payload.rawCv,
          parsed_skills: payload.parsedSkills,
          career_story: payload.careerStory,
          target_roles: payload.targetRoles,
        }),
      });

      if (updateResponse.ok) {
        const updated = await updateResponse.json();
        if (updated.profile) {
          setProfile(updated.profile);
        }
      }
    } catch (error) {
      console.error("Profile update failed after upload:", error);
    }
  };

  useEffect(() => {
    if (chatComplete && profile?.raw_cv && jobs.length === 0 && !searching) {
      void handleFindJobs();
    }
  }, [chatComplete, profile?.raw_cv]);

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
        {loading ? (
          <div className="space-y-5">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-52 w-full rounded-xl" />
          </div>
        ) : null}

        {/* Resume Upload Section */}
        <AnimatePresence mode="wait">
          {!loading && !profile?.raw_cv ? (
            <motion.div
              key="manual-upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mb-8 bg-card border border-border rounded-xl p-6 shadow-sm"
            >
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
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!loading && profile?.raw_cv ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mb-8 bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Resume Snapshot</h2>
            <div className="space-y-4">
              {profile.parsed_skills && profile.parsed_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.parsed_skills.slice(0, 10).map((skill, index) => (
                    <Badge key={`${skill}-${index}`} variant="secondary" className="text-xs rounded-full">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {profile.career_story ? (
                <p className="text-sm text-muted-foreground">{profile.career_story}</p>
              ) : null}

              {!chatComplete ? (
                <p className="text-xs text-muted-foreground">
                  Complete resume chat once, then we will generate high-quality matched mock jobs automatically.
                </p>
              ) : (
                <p className="text-xs text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Chat completed. Job matching uses your CV skills and chat context.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}

        {/* Job Search Section */}
        {!loading && profile?.raw_cv ? (
          <div className="mb-8">
            <Button
              onClick={handleFindJobs}
              disabled={searching}
              className="rounded-full"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding Jobs...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find Jobs
                </>
              )}
            </Button>
          </div>
        ) : null}

        {searching ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="rounded-xl p-4 border-border/70">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-3 w-52" />
                    </div>
                  </div>
                  <Skeleton className="h-14 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mt-3" />
              </Card>
            ))}
          </div>
        ) : null}

        {!searching && jobs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              {jobs.length} quality mock matches generated from your CV skills
            </div>

            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="rounded-xl border-border/70 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="h-9 w-9 rounded-full bg-primary/12 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {job.logoLabel}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {job.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.company} • {job.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.requiredSkills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-[10px] py-0 rounded-full">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <MatchPie score={job.score} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      className="h-8 rounded-full px-3"
                      onClick={() => handleGenerateCoverLetter(job)}
                      disabled={generating[job.id]}
                    >
                      {generating[job.id] ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full px-3"
                      disabled={!generated[job.id] || sending[job.id]}
                      onClick={() => handleSendWithGmail(job)}
                    >
                      {sending[job.id] ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send via Gmail"
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {generating[job.id] ? (
                      <motion.div
                        key={`${job.id}-skeleton`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </motion.div>
                    ) : null}

                    {generated[job.id] ? (
                      <motion.div
                        key={`${job.id}-cover-letter`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="mt-3 rounded-lg border border-border bg-muted/40 p-3"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                          Personalized Cover Letter
                        </p>
                        <Textarea
                          value={generated[job.id]}
                          readOnly
                          className="min-h-44 text-xs leading-relaxed bg-background"
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {/* Resume Upload Panel */}
        {!loading && !profile?.raw_cv ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Or Upload PDF Resume
            </h2>
            <ResumeUploadPanel
              onResumeAnalyzed={(payload) => {
                void handleResumeAnalyzed(payload);
              }}
              onChatClosed={() => {
                setChatComplete(true);
              }}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
