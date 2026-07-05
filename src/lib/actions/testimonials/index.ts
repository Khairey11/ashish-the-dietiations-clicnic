"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const submitSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  age: z.string().max(10).optional(),
  city: z.string().max(120).optional(),
  condition: z.string().min(2, "Condition is required").max(120),
  duration: z.string().max(60).optional(),
  quote: z.string().min(20, "Please share at least a sentence").max(1000),
  rating: z.coerce.number().min(1).max(5).default(5),
  highlight: z.string().max(200).optional(),
});

export type TestimonialSubmission = z.infer<typeof submitSchema>;

/**
 * Public testimonial submission server action.
 * Creates a Testimonial with isApproved=false for admin review.
 */
export async function submitTestimonial(input: TestimonialSubmission) {
  try {
    const parsed = submitSchema.parse(input);

    const initials = parsed.name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const testimonial = await db.testimonial.create({
      data: {
        name: parsed.name,
        age: parsed.age ? parseInt(parsed.age, 10) : null,
        city: parsed.city || null,
        condition: parsed.condition,
        duration: parsed.duration || null,
        quote: parsed.quote,
        rating: parsed.rating,
        highlight: parsed.highlight || parsed.condition,
        initials,
        accent: "from-emerald-500 to-teal-500",
        tag: "WEBSITE",
        isApproved: false,
        isFeatured: false,
      },
    });

    return {
      success: true,
      testimonialId: testimonial.id,
      message: "Thank you! Your testimonial has been submitted and will appear after review.",
    };
  } catch (error) {
    console.error("Testimonial submission failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Submission failed",
    };
  }
}
