"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "assistant" | "user";
  content: string;
  theme?: string;
}

interface TonalityChatProps {
  onComplete: () => void;
  backendUrl?: string;
}

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

export function TonalityChat({
  onComplete,
  backendUrl = "http://localhost:3000",
}: TonalityChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize: fetch first question
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/tonality/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to start chat");
        }

        setSessionId(data.session_id);
        setMessages([
          {
            role: "assistant",
            content: data.question,
            theme: data.question_theme,
          },
        ]);
      } catch (error) {
        console.error("Chat initialization error:", error);
        setMessages([
          {
            role: "assistant",
            content:
              "Sorry, I couldn't start the conversation. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [backendUrl]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isSubmitting) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsSubmitting(true);

    // Add user message
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);

    try {
      const response = await fetch(`${backendUrl}/api/tonality/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_answer: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      if (data.type === "complete") {
        // Start analysis
        setIsSubmitting(true);
        const analysisResponse = await fetch(
          `${backendUrl}/api/tonality/analyze`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );

        const analysisData = await analysisResponse.json();

        if (!analysisResponse.ok) {
          throw new Error(analysisData.error || "Failed to analyze");
        }

        setAnalysis(analysisData.analysis);
        setIsComplete(true);
      } else if (data.question) {
        // Add AI response
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.question,
            theme: data.question_theme,
          },
        ]);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again or contact support.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-flex animate-spin mb-4">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent"></div>
          </div>
          <p className="text-muted-foreground">
            Starting your profile interview...
          </p>
        </div>
      </div>
    );
  }

  if (isComplete && analysis) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Your Career Profile
          </h2>

          <div className="space-y-6">
            {/* Tone Style */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Your Tone
              </p>
              <p className="text-lg text-foreground">
                {analysis.tone_style}
              </p>
            </div>

            {/* Communication Style */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                How You Communicate
              </p>
              <p className="text-lg text-foreground">
                {analysis.communication_style}
              </p>
            </div>

            {/* Personality Traits */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                Your Traits
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.personality_traits.map((trait, idx) => (
                  <Badge key={idx} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Career Preferences */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                What You Value
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background/50 p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Environment
                  </p>
                  <p className="text-sm text-foreground">
                    {analysis.career_preferences.work_environment}
                  </p>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Aspiration
                  </p>
                  <p className="text-sm text-foreground">
                    {analysis.career_preferences.career_aspiration}
                  </p>
                </div>
              </div>
            </div>

            {/* Values */}
            {analysis.career_preferences.values.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-3">
                  Your Values
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.career_preferences.values.map((value, idx) => (
                    <Badge key={idx} variant="outline">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={onComplete}
            className="w-full mt-8"
            size="lg"
          >
            Start Finding Jobs →
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 flex flex-col h-screen max-h-screen">
      {/* Messages */}
      <ScrollArea className="flex-1 mb-6 pr-4">
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              } animate-in fade-in duration-150`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.theme && message.role === "assistant" && (
                  <p className="text-xs mt-2 opacity-60">
                    Topic: {message.theme}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isSubmitting && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Share your thoughts..."
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isSubmitting || !inputValue.trim()}
          size="sm"
        >
          {isSubmitting ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
