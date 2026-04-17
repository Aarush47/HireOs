import type { NudgeCard } from "@/lib/agents/types";

type TrackedApplication = {
  id: string;
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected" | "ghosted";
  appliedAt?: string | null;
  nudgeSentAt?: string | null;
};

export function computeNudges(params: {
  now?: Date;
  applications: TrackedApplication[];
  applicationsInLastFiveDays: number;
}): NudgeCard[] {
  const now = params.now ?? new Date();
  const cards: NudgeCard[] = [];

  for (const application of params.applications) {
    if (application.status !== "applied" || !application.appliedAt) {
      continue;
    }

    const appliedDate = new Date(application.appliedAt);
    const daysSinceApply = Math.floor(
      (now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceApply > 14) {
      cards.push({
        applicationId: application.id,
        type: "ghosted_suggestion",
        title: "No response yet",
        body: "This application is over 14 days old. Consider marking it as ghosted to keep your pipeline accurate.",
        actionLabel: "Mark as ghosted",
      });
      continue;
    }

    if (daysSinceApply > 7 && !application.nudgeSentAt) {
      cards.push({
        applicationId: application.id,
        type: "follow_up",
        title: "Time to follow up",
        body: "It has been over 7 days since you applied. Generate a concise follow-up note now.",
        actionLabel: "Draft follow-up",
      });
    }
  }

  if (params.applicationsInLastFiveDays === 0) {
    cards.push({
      type: "motivation",
      title: "Keep momentum",
      body: "No applications in 5 days. Pick one strong role today and move it to applied.",
      actionLabel: "Open discover",
    });
  }

  return cards;
}
