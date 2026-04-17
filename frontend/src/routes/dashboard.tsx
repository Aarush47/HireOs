import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, useUser, UserButton } from "@clerk/react";
import { useEffect } from "react";
import { ResumeUploadPanel } from "@/components/dashboard/ResumeUploadPanel";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/auth" });
    }
  }, [isLoaded, isSignedIn, navigate]);

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
            <p className="text-sm text-muted-foreground">Welcome, {user?.firstName}!</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Resume Upload Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Step 1: Upload Your Resume
          </h2>
          <ResumeUploadPanel />
        </div>

        {/* Stats Card */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            Profile
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">
                {user?.createdAt?.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Upcoming Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Build Resume", description: "AI-powered resume tailoring" },
              { title: "Find Jobs", description: "Intelligent job matching" },
              { title: "Track Applications", description: "Manage your pipeline" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-4 border border-border/50 rounded-md hover:bg-muted/50 transition cursor-pointer"
              >
                <h3 className="font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
