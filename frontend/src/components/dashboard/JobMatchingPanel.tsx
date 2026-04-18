import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, CheckCircle } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  redirect_url?: string;
}

interface MatchedJob {
  job_id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  match_reasons: string[];
  alignment_with_values: string;
  growth_potential: string;
  communication_fit: string;
}

interface JobMatchingPanelProps {
  backendUrl?: string;
  onNavigate?: (page: string) => void;
}

export function JobMatchingPanel({
  backendUrl = "http://localhost:3000",
  onNavigate,
}: JobMatchingPanelProps) {
  const { isLoaded } = useAuth();
  const [isSearching, setIsSearching] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<MatchedJob | null>(null);

  useEffect(() => {
    if (isLoaded) {
      searchAndMatchJobs();
    }
  }, [isLoaded]);

  const searchAndMatchJobs = async () => {
    try {
      setIsSearching(true);
      setError(null);

      // Step 1: Search for jobs using multiple keywords based on typical career keywords
      const keywords = [
        "software engineer",
        "product manager",
        "designer",
        "data analyst",
        "business analyst",
      ];

      const allJobs: Job[] = [];

      for (const keyword of keywords) {
        console.log("🔍 Searching for:", keyword);
        const searchRes = await fetch(`${backendUrl}/api/jobs/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keywords: keyword,
            location: "UK",
            results_per_page: 5,
          }),
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          allJobs.push(...(searchData.jobs || []));
        }
      }

      console.log("✅ Found", allJobs.length, "total jobs");

      if (allJobs.length === 0) {
        setError("No jobs found. Please try again.");
        setIsSearching(false);
        return;
      }

      // Step 2: Match jobs with user profile using Gemini
      setIsMatching(true);
      console.log("🎯 Matching jobs with user profile...");

      const matchRes = await fetch(`${backendUrl}/api/jobs/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: allJobs.slice(0, 15) }),
      });

      if (!matchRes.ok) {
        const matchErr = await matchRes.json();
        throw new Error(matchErr.error || "Failed to match jobs");
      }

      const matchData = await matchRes.json();
      setMatchedJobs(matchData.matched_jobs || []);
      console.log(
        "✅ Matched",
        matchData.matched_jobs?.length || 0,
        "jobs successfully"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error matching jobs";
      console.error("Job matching error:", err);
      setError(msg);
    } finally {
      setIsSearching(false);
      setIsMatching(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSearching || isMatching) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold">
              {isSearching ? "Searching for jobs..." : "Matching jobs to your profile..."}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {isSearching
                ? "We're finding opportunities that match your interests and experience."
                : "Using AI to analyze how well each job fits your career preferences and communication style."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Card className="p-8 border-red-200 bg-red-50">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={searchAndMatchJobs} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <Button
          onClick={() => setSelectedJob(null)}
          variant="ghost"
          className="mb-6"
        >
          ← Back to Results
        </Button>

        <Card className="p-8 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{selectedJob.title}</h2>
            <p className="text-lg text-muted-foreground">{selectedJob.company} • {selectedJob.location}</p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Match Score</h3>
              <div className="text-4xl font-bold text-primary">
                {selectedJob.match_score}%
              </div>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${selectedJob.match_score}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Why This Role Matches You</h4>
              <ul className="space-y-2">
                {selectedJob.match_reasons.map((reason, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Alignment With Values</p>
                <p className="text-sm">{selectedJob.alignment_with_values}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Communication Fit</p>
                <p className="text-sm">{selectedJob.communication_fit}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Growth Potential</p>
              <p className="text-sm">{selectedJob.growth_potential}</p>
            </div>
          </div>

          <Button className="w-full" size="lg">
            View Full Job Posting →
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Your Matched Jobs</h2>
          <p className="text-muted-foreground mt-2">
            {matchedJobs.length} opportunities tailored to your profile
          </p>
        </div>
        <TrendingUp className="w-12 h-12 text-primary opacity-50" />
      </div>

      <div className="grid gap-4">
        {matchedJobs.map((job) => (
          <Card
            key={job.job_id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedJob(job)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                <p className="text-muted-foreground">
                  {job.company} • {job.location}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {job.match_score}%
                </div>
                <p className="text-xs text-muted-foreground">Match</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full bg-primary/20 rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${job.match_score}%` }}
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Why It Matches:</p>
              <div className="flex flex-wrap gap-2">
                {job.match_reasons.slice(0, 2).map((reason, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground line-clamp-2">
              {job.alignment_with_values}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={() => onNavigate?.("dashboard")}
        >
          Back to Dashboard
        </Button>
        <Button onClick={searchAndMatchJobs}>
          Refresh Results
        </Button>
      </div>
    </div>
  );
}
