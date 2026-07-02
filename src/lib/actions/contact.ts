"use server";

import * as React from "react";
import { z } from "zod";
import { db } from "@/lib/db";

// ============================================================
// BOOKING ACTION
// ============================================================

const bookingSchema = z.object({
  service: z.string().min(1, "Service is required"),
  dietitian: z.string().min(1, "Dietitian is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Valid phone is required"),
  age: z.string().optional(),
  goal: z.string().optional(),
  medical: z.string().optional(),
  program: z.string().optional(),
  paymentMethod: z.string().default("khalti"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export async function createBooking(input: BookingInput) {
  try {
    const parsed = bookingSchema.parse(input);

    // Find or create the client (User + Patient)
    let user = await db.user.findUnique({
      where: { email: parsed.email.toLowerCase() },
      include: { patient: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: parsed.email.toLowerCase(),
          name: parsed.name,
          phone: parsed.phone,
          role: "CLIENT",
          patient: {
            create: {
              primaryGoal: parsed.goal || undefined,
              medicalHistory: parsed.medical || undefined,
              condition: parsed.service,
              startDate: new Date(),
            },
          },
        },
        include: { patient: true },
      });
    } else if (!user.patient) {
      await db.patient.create({
        data: {
          userId: user.id,
          primaryGoal: parsed.goal || undefined,
          medicalHistory: parsed.medical || undefined,
          condition: parsed.service,
          startDate: new Date(),
        },
      });
      user = await db.user.findUnique({
        where: { id: user.id },
        include: { patient: true },
      });
    }

    if (!user?.patient) {
      throw new Error("Failed to create patient profile");
    }

    // Resolve dietitian by slug (matches seed: anita-shrestha → email)
    // The parsed.dietitian is a slug like "anita-shrestha"
    const dietitianEmail = `${parsed.dietitian.replace(/-/g, ".")}@thedietitiansclinic.health`;
    const dietitian = await db.dietitian.findFirst({
      where: {
        OR: [
          { userId: parsed.dietitian },
          { user: { email: dietitianEmail } },
        ],
      },
    });

    if (!dietitian) {
      // Fallback: pick the first available dietitian
      const fallback = await db.dietitian.findFirst({ where: { isActive: true } });
      if (!fallback) {
        throw new Error("No dietitian available");
      }
      parsed.dietitian = fallback.id;
    } else {
      parsed.dietitian = dietitian.id;
    }

    // Resolve service by slug
    let serviceId: string | undefined;
    const service = await db.service.findUnique({ where: { slug: parsed.service } });
    if (service) serviceId = service.id;

    // Resolve program
    let programId: string | undefined;
    if (parsed.program) {
      const program = await db.program.findUnique({
        where: { slug: parsed.program },
      });
      programId = program?.id;
    }

    // Build scheduledAt from date + time
    const timeMatch = parsed.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let scheduledAt = new Date(parsed.date);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const meridian = timeMatch[3].toUpperCase();
      if (meridian === "PM" && hours !== 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
      scheduledAt.setHours(hours, minutes, 0, 0);
    }

    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        clientId: user.id,
        patientId: user.patient.id,
        dietitianId: parsed.dietitian,
        serviceId,
        programId,
        scheduledAt,
        status: "CONFIRMED",
        mode: "VIDEO",
        meetingLink: `https://meet.thedietitiansclinic.health/${Date.now().toString(36)}`,
        notes: parsed.goal || parsed.medical || undefined,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "BOOKING_CONFIRMED",
        title: "Appointment confirmed",
        body: `Your consultation on ${scheduledAt.toLocaleString()} has been confirmed. Check your email for the meeting link.`,
        link: "/dashboard",
      },
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "BOOKING_CREATED",
        entity: "Appointment",
        entityId: appointment.id,
        metadata: JSON.stringify({ service: parsed.service, dietitian: parsed.dietitian }),
      },
    });

    return {
      success: true,
      appointmentId: appointment.id,
      message: "Booking confirmed. A confirmation email is on its way.",
    };
  } catch (error) {
    console.error("Booking creation failed:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}

// ============================================================
// CONTACT FORM ACTION
// ============================================================

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Valid phone is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export async function submitContactForm(input: ContactInput) {
  try {
    const parsed = contactSchema.parse(input);

    // Persist as a Lead
    const lead = await db.lead.create({
      data: {
        name: parsed.name,
        email: parsed.email.toLowerCase(),
        phone: parsed.phone,
        message: parsed.message,
        source: "WEBSITE",
        status: "NEW",
      },
    });

    // Activity log
    await db.activityLog.create({
      data: {
        action: "LEAD_CREATED",
        entity: "Lead",
        entityId: lead.id,
        metadata: JSON.stringify({ source: "contact_form" }),
      },
    });

    return {
      success: true,
      leadId: lead.id,
      message: "Message received. Our team will respond within 1 hour.",
    };
  } catch (error) {
    console.error("Contact form submission failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Submission failed",
    };
  }
}

// ============================================================
// NEWSLETTER SUBSCRIPTION
// ============================================================

const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export async function subscribeNewsletter(input: { email: string }) {
  try {
    const parsed = newsletterSchema.parse(input);

    // Upsert (so unsubscribes can re-subscribe)
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: parsed.email.toLowerCase() },
    });

    if (existing) {
      if (!existing.isActive) {
        await db.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true, unsubscribedAt: null, subscribedAt: new Date() },
        });
        return { success: true, message: "Welcome back! You're re-subscribed." };
      }
      return { success: true, message: "You're already subscribed." };
    }

    await db.newsletterSubscriber.create({
      data: {
        email: parsed.email.toLowerCase(),
        source: "FOOTER",
        isActive: true,
      },
    });

    return {
      success: true,
      message: "Subscribed! Welcome to the weekly nutrition newsletter.",
    };
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription failed",
    };
  }
}

// ============================================================
// LEAD CREATION (generic)
// ============================================================

export async function createLead(input: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  service?: string;
  source?: string;
}) {
  try {
    const lead = await db.lead.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        message: input.message,
        service: input.service,
        source: (input.source as any) || "WEBSITE",
        status: "NEW",
      },
    });
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("Lead creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lead creation failed",
    };
  }
}
