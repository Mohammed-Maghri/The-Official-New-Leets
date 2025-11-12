import { z } from "zod";

// Zod Validation Schema
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
  (data: {
    feedback?: string;
    dislikes?: string;
    improvements?: string;
    rating: number;
    skills?: string;
    contributionArea?: string[];
  }) => {
    // At least one field (feedback, dislikes, or improvements) must be filled
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

// TypeScript Interfaces
export interface FeedbackFormData {
  feedback: string;
  dislikes: string;
  improvements: string;
  rating: number;
  skills: string;
  contributionArea: string[];
}

export interface FeedbackPopupProps {
  onClose: () => void;
  username?: string;
}

export interface FormErrors {
  feedback?: string;
  dislikes?: string;
  improvements?: string;
  rating?: string;
  skills?: string;
  contributionArea?: string;
}

// Infer type from Zod schema
export type FeedbackSchemaType = z.infer<typeof feedbackSchema>;
