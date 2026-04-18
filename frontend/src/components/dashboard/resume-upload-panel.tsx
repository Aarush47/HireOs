"use client";

import { useAuth } from "@clerk/react";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { TonalityChat } from "@/components/onboarding/TonalityChat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";

interface AnalysisResult {
  tone_style: string;
  communication_style: string;
  personality_traits: string[];
  career_preferences: {
    work_environment: string;
    motivation_drivers: string[];
    values: string[];
    communication_preference: string;
    career_aspiration: string;
    strengths_they_own: string[];
  };
}

export function ResumeUploadPanel() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showTonality, setShowTonality] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are supported");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${backendURL}/api/upload-resume`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUploadSuccess(true);

      // Automatically show tonality chat after 1 second
      setTimeout(() => {
        setShowTonality(true);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTonalityComplete = (analysisData: AnalysisResult) => {
    setAnalysis(analysisData);
    setShowTonality(false);
    setShowProfile(true);
  };

  const handleStartJobs = () => {
    router.navigate({ to: "/dashboard/jobs" });
  };

  // Show tonality chat
  if (showTonality) {
    return (
      <TonalityChat
        onComplete={handleTonalityComplete}
        backendUrl={backendURL}
      />
    );
  }

  // Show profile completion card
  if (showProfile && analysis) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 border-0 shadow-lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Your Profile is Ready
              </h2>
              <p className="text-slate-600">
                We've captured your professional style and preferences
              </p>
            </div>

            {/* Tone Style */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Your Tone</h4>
              <p className="text-slate-700">{analysis.tone_style}</p>
            </div>

            {/* Communication Style */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">
                Communication Style
              </h4>
              <p className="text-slate-700">{analysis.communication_style}</p>
            </div>

            {/* Traits */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Your Traits</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.personality_traits.map((trait) => (
                  <Badge
                    key={trait}
                    className="bg-blue-100 text-blue-900 hover:bg-blue-100"
                  >
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Career Prefs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                  Work Environment
                </p>
                <p className="text-sm text-slate-700">
                  {analysis.career_preferences.work_environment}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                  Career Aspiration
                </p>
                <p className="text-sm text-slate-700">
                  {analysis.career_preferences.career_aspiration}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleStartJobs}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base"
            >
              Start Finding Jobs <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show upload form
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Upload Your Resume
            </h2>
            <p className="text-slate-600">
              Start by sharing your PDF resume. We'll analyze it to match you with perfect job opportunities.
            </p>
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="pointer-events-none">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">
                  {file ? file.name : "Click to browse or drag your PDF"}
                </p>
                {!file && (
                  <p className="text-xs text-slate-500 mt-1">
                    Only PDF files are supported (max 10MB)
                  </p>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
            >
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Button>

            {/* Success Message */}
            {uploadSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700">
                  Resume uploaded successfully!
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
