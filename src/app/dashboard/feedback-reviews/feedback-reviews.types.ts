export interface FeedbackReview {
  id: number;
  user_login: string;
  user_email: string;
  user_image: string;
  campus_id: number;
  campus_name: string;
  feedback: string | null;
  dislikes: string | null;
  improvements: string | null;
  rating: number;
  wants_to_contribute: boolean;
  skills: string | null;
  contribution_area: string[] | null;
  badge_awarded: boolean;
  badge_type: string | null;
  created_at: string;
}

export const BADGE_TYPES = {
  GENIUS: "Genius",
  HELPFUL: "Helpful",
  INNOVATIVE: "Innovative",
  CRITICAL_THINKER: "Critical Thinker",
  CONTRIBUTOR: "Contributor",
} as const;

export type BadgeType = typeof BADGE_TYPES[keyof typeof BADGE_TYPES];
