"use server";

import * as React from "react";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";

/** Get client IP from server action context. */
async function actionIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

// ============================================================
// BOOKING ACTION
// ============================================================

const bookingSchema = z.object({
  service: z.string().min(1, "Service is required"),
  dietitian: z.string().min(1, "Dietitian is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email is required").max(160),
  phone: z.string().min(7, "Valid phone is required").max(32),
  age: z.string().max(10).optional(),
  goal: z.string().max(1000).optional(),
  medical: z.string().max(2000).optional(),
  program: z.string().max(80).optional(),
  paymentMethod: z.enum(["khalti", "esewa", "bank"]).default("khalti"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export async function createBooking(input: BookingInput) {
  try {
    // Rate limit: 5 bookings per hour per IP
    const ip = await actionIp();
    const rl = rateLimit({ key: `booking:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
      return {
        success: false,
        error: "Too many booking attempts. Please try again later.",
      };
    }

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

    // Resolve dietitian by slug — the parsed.dietitian value is a slug
    // like "anita-shrestha"; we derive the matching seeded email.
    const dietitianEmail = `${parsed.dietitian.replace(/-/g, ".")}@thedietitiansclinic.health`;
    const dietitian = await db.dietitian.findFirst({
      where: { user: { email: dietitianEmail } },
      include: { user: true },
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
    let programData: { duration: string; price: number } | null = null;
    if (parsed.program) {
      const program = await db.program.findUnique({
        where: { slug: parsed.program },
      });
      programId = program?.id;
      if (program) programData = { duration: program.duration, price: program.price };
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
        meetingLink: `https://meet.google.com/${crypto.randomUUID().slice(0, 10)}`,
        notes: parsed.goal || parsed.medical || undefined,
      },
    });

    // Create a pending Payment row (admin verifies the WhatsApp screenshot)
    let paymentId: string | undefined;
    if (programId) {
      const program = await db.program.findUnique({ where: { id: programId } });
      if (program) {
        const methodMap: Record<string, "KHALTI" | "ESEWA" | "BANK_TRANSFER"> = {
          khalti: "KHALTI",
          esewa: "ESEWA",
          bank: "BANK_TRANSFER",
        };
        const payment = await db.payment.create({
          data: {
            clientId: user.id,
            programId,
            amount: program.price,
            currency: "NPR",
            method: methodMap[parsed.paymentMethod] || "KHALTI",
            status: "PENDING",
            txnRef: `BOOKING-${appointment.id.slice(-8).toUpperCase()}`,
            metadata: JSON.stringify({
              appointmentId: appointment.id,
              bookingRef: appointment.id,
              method: parsed.paymentMethod,
              mode: "qr_whatsapp",
            }),
          },
        });
        paymentId = payment.id;
      }
    }

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
        metadata: JSON.stringify({
          service: parsed.service,
          dietitian: parsed.dietitian,
          paymentId,
          paymentStatus: paymentId ? "PENDING" : "NONE",
        }),
      },
    });

    // Send booking confirmation email (non-blocking — don't fail if email fails)
    const { sendBookingConfirmation } = await import("@/lib/email");
    sendBookingConfirmation({
      clientName: parsed.name,
      clientEmail: parsed.email,
      service: service?.title || parsed.service,
      dietitian: dietitian?.name || "Assigned dietitian",
      date: scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      time: parsed.time,
      program: programData?.duration,
      amount: programData?.price,
    }).catch(() => {
      // Email failure shouldn't break the booking
    });

    return {
      success: true,
      appointmentId: appointment.id,
      paymentId,
      message: "Booking confirmed. Our team will WhatsApp you to verify your payment and slot.",
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
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email is required").max(160),
  phone: z.string().min(7, "Valid phone is required").max(32),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;

export async function submitContactForm(input: ContactInput) {
  try {
    // Rate limit: 5 contact submissions per hour per IP
    const ip = await actionIp();
    const rl = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
      return {
        success: false,
        error: "Too many messages. Please try again later.",
      };
    }

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

    // Send lead notification email to admin (non-blocking)
    const { sendLeadNotification } = await import("@/lib/email");
    sendLeadNotification({
      leadName: parsed.name,
      leadEmail: parsed.email,
      leadPhone: parsed.phone,
      message: parsed.message,
    }).catch(() => {
      // Email failure shouldn't break the form submission
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
    // Rate limit: 10 subscriptions per hour per IP
    const ip = await actionIp();
    const rl = rateLimit({ key: `newsletter:${ip}`, limit: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
      return {
        success: false,
        error: "Too many attempts. Please try again later.",
      };
    }

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


