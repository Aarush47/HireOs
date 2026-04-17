import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/react";
import { useEffect } from "react";
import { useAuth } from "@clerk/react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate({ to: "/dashboard" });
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <ClerkLoading>
          <div className="text-center text-gray-500">Loading...</div>
        </ClerkLoading>
        <ClerkLoaded>
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-card border border-border rounded-lg shadow-lg",
              },
            }}
            redirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </ClerkLoaded>
      </div>
    </div>
  );
}
