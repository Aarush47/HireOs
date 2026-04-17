export type ToneProfile = "formal" | "casual" | "technical";

export type MatchAgentResult = {
  score: number;
  gaps: string[];
  strengths: string[];
  one_line_verdict: string;
};

export type MaterialType = "resume" | "cover_letter";

export type MaterialAgentResult = {
  content: string;
};

export type NudgeType = "follow_up" | "ghosted_suggestion" | "motivation";

export type NudgeCard = {
  applicationId?: string;
  type: NudgeType;
  title: string;
  body: string;
  actionLabel: string;
};

export type UserProfile = {
  id: string;
  full_name?: string | null;
  headline?: string | null;
  parsed_skills?: Record<string, unknown>;
  career_story?: string | null;
  tone_profile?: ToneProfile | null;
};

export type JobSnapshot = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  jd_raw: string;
  jd_parsed?: Record<string, unknown>;
};
