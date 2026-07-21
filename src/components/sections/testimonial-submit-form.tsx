"use client";

import * as React from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { submitTestimonial } from "@/lib/actions/testimonials";

export function TestimonialSubmitForm() {
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState("");
  const [city, setCity] = React.useState("");
  const [condition, setCondition] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [quote, setQuote] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await submitTestimonial({
        name,
        age: age || undefined,
        city: city || undefined,
        condition,
        duration: duration || undefined,
        quote,
        rating,
      });
      if (result.success) {
        setSubmitted(true);
        toast.success("Thank you!", {
          description: result.message,
        });
        // Reset form
        setName(""); setAge(""); setCity(""); setCondition("");
        setDuration(""); setQuote(""); setRating(5);
      } else {
        toast.error("Submission failed", { description: result.error });
      }
    } catch {
      toast.error("Submission failed", {
        description: "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-6 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Thank you for sharing!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Your testimonial has been submitted. Our team will review it and publish it shortly.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="t-name" className="text-xs">Full name *</Label>
          <Input
            id="t-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sneha Karki"
            required
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-age" className="text-xs">Age</Label>
          <Input
            id="t-age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="32"
            className="h-11"
            min={10}
            max={100}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="t-city" className="text-xs">City</Label>
          <Input
            id="t-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Dharan"
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-condition" className="text-xs">Condition / Goal *</Label>
          <Input
            id="t-condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="PMOS, Weight Loss, Diabetes..."
            required
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="t-duration" className="text-xs">Program duration</Label>
        <Input
          id="t-duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 90 days, 6 months"
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Your rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-1"
              aria-label={`${n} stars`}
            >
              <Star
                className={cn(
                  "w-7 h-7 transition-all",
                  n <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30 hover:text-amber-400/50"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="t-quote" className="text-xs">Your story *</Label>
        <Textarea
          id="t-quote"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Share your experience with Ashish Nutrition Clinic. What changed for you? How did the team help? (min 20 characters)"
          rows={5}
          required
          minLength={20}
          className="resize-none"
        />
        <p className="text-[10px] text-muted-foreground">{quote.length}/1000 characters</p>
      </div>

      <Button
        type="submit"
        disabled={submitting || !name || !condition || quote.length < 20}
        className="w-full h-11 bg-gradient-to-r from-primary to-secondary"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit testimonial
          </>
        )}
      </Button>

      <p className="text-center text-[10px] text-muted-foreground">
        Submissions are reviewed by our team before publishing.
      </p>
    </form>
  );
}
