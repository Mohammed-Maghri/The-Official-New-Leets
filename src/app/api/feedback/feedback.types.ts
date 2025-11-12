import { z } from "zod";

export const feedbackSchema = z.object({
  feedback: z
    .string()
    .min(20, "Feature ideas must be at least 20 characters")
    .max(1000, "Feature ideas must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  dislikes: z
    .string()
    .min(10, "Dislikes must be at least 10 characters")
    .max(1000, "Dislikes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  improvements: z
    .string()
    .min(10, "Improvements must be at least 10 characters")
    .max(1000, "Improvements must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  rating: z
    .number()
    .min(1, "Please rate your experience")
    .max(5),
  skills: z
    .string()
    .min(5, "Skills must be at least 5 characters")
    .max(500, "Skills must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  contributionArea: z.array(z.string()).optional(),
}).refine(
  (data) => {
    return (
      (data.feedback && data.feedback.length >= 20) ||
      (data.dislikes && data.dislikes.length >= 10) ||
      (data.improvements && data.improvements.length >= 10)
    );
  },
  {
    message: "You must fill at least one feedback field with meaningful content",
    path: ["feedback"],
  }
);

export interface FeedbackRecord {
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
  created_at: Date;
}

export const BADGE_TYPES = {
  CONTRIBUTOR: "Contributor",
  TOP_FEEDBACK: "Top Feedback",
  HELPFUL: "Helpful",
  INNOVATIVE: "Innovative",
  CRITICAL_THINKER: "Critical Thinker",
  VIP: "VIP",
} as const;

export type BadgeType = typeof BADGE_TYPES[keyof typeof BADGE_TYPES];

export const awardBadgeSchema = z.object({
  feedbackId: z.number(),
  badgeType: z.enum([
    BADGE_TYPES.CONTRIBUTOR,
    BADGE_TYPES.TOP_FEEDBACK,
    BADGE_TYPES.HELPFUL,
    BADGE_TYPES.INNOVATIVE,
    BADGE_TYPES.CRITICAL_THINKER,
    BADGE_TYPES.VIP,
  ]),
  customMessage: z.string().max(500).optional(),
});

export type AwardBadgeSchemaType = z.infer<typeof awardBadgeSchema>;

export type FeedbackSchemaType = z.infer<typeof feedbackSchema>;
