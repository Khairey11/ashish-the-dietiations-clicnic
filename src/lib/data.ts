import {
  Activity,
  Apple,
  Baby,
  Dumbbell,
  HeartPulse,
  Heart,
  Leaf,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  title: string;
  icon: LucideIcon;
  tagline: string;
  problem: string;
  solution: string;
  benefits: string[];
  duration: string;
  accent: string;
  category: "weight" | "medical" | "life-stage" | "performance" | "corporate";
};

export const services: Service[] = [
  {
    slug: "weight-loss",
    title: "Weight Loss Program",
    icon: TrendingDown,
    tagline: "Sustainable fat loss without crash diets",
    problem:
      "Fad diets, slow metabolism, emotional eating and yo-yo weight cycling make lasting fat loss feel impossible.",
    solution:
      "A science-backed calorie framework paired with high-protein meals, behavioural coaching and weekly accountability check-ins.",
    benefits: [
      "Lose 4–8 kg in 12 weeks (clinically supervised)",
      "Preserve lean muscle & metabolic rate",
      "Personalised macros and food swaps",
      "Habit-based behavioural coaching",
    ],
    duration: "12–24 weeks",
    accent: "from-emerald-500/20 to-emerald-500/5",
    category: "weight",
  },
  {
    slug: "weight-gain",
    title: "Healthy Weight Gain",
    icon: TrendingUp,
    tagline: "Build mass the clean, sustainable way",
    problem:
      "Hard gainers struggle to consume enough calories from nutrient-dense sources, often resorting to junk food.",
    solution:
      "Calorie-dense whole-food meal plans with progressive overload training support and digestive optimisation.",
    benefits: [
      "Gain 2–4 kg lean mass in 8 weeks",
      "Calorie-dense, low-satiety meals",
      "Gut-friendly digestion protocols",
      "Strength training sync",
    ],
    duration: "8–16 weeks",
    accent: "from-amber-500/20 to-amber-500/5",
    category: "weight",
  },
  {
    slug: "pcos-diet",
    title: "PCOS Nutrition",
    icon: Heart,
    tagline: "Balance hormones with food",
    problem:
      "Insulin resistance, irregular cycles and weight gain from PCOS disrupt daily life and long-term health.",
    solution:
      "Low-glycaemic, anti-inflammatory meal architecture combined with chromium & inositol-rich food protocols.",
    benefits: [
      "Improve cycle regularity",
      "Reduce insulin resistance markers",
      "Anti-inflammatory food framework",
      "Skin & hair co-benefits",
    ],
    duration: "12 weeks",
    accent: "from-pink-500/20 to-pink-500/5",
    category: "medical",
  },
  {
    slug: "diabetes-diet",
    title: "Diabetes Management",
    icon: Activity,
    tagline: "Stabilise blood sugar, reclaim energy",
    problem:
      "Erratic glucose levels, medication dependence and fear of complications dominate life with diabetes.",
    solution:
      "Carbohydrate-counted, fibre-forward meal plans with continuous glucose monitoring integration.",
    benefits: [
      "Lower HbA1c by 1–2% in 12 weeks",
      "Reduce medication dependence",
      "CGM-guided personalisation",
      "Prevent long-term complications",
    ],
    duration: "Ongoing",
    accent: "from-sky-500/20 to-sky-500/5",
    category: "medical",
  },
  {
    slug: "thyroid-diet",
    title: "Thyroid Nutrition",
    icon: HeartPulse,
    tagline: "Support your thyroid with the right fuel",
    problem:
      "Fatigue, weight fluctuation and brain fog from hypo/hyperthyroidism are worsened by nutrient gaps.",
    solution:
      "Selenium, iodine and zinc-optimised meals with goitrogen-aware preparation techniques.",
    benefits: [
      "Support thyroid hormone synthesis",
      "Energy & metabolism recovery",
      "Goitrogen-safe cooking methods",
      "Medication timing guidance",
    ],
    duration: "12 weeks",
    accent: "from-violet-500/20 to-violet-500/5",
    category: "medical",
  },
  {
    slug: "pregnancy-nutrition",
    title: "Pregnancy Nutrition",
    icon: Baby,
    tagline: "Nourish two lives, trimester by trimester",
    problem:
      "Morning sickness, gestational diabetes risk and confusion about what is safe create anxiety during pregnancy.",
    solution:
      "Trimester-wise meal architecture with folate, iron, DHA and calcium optimisation.",
    benefits: [
      "Trimester-specific meal plans",
      "Reduce gestational diabetes risk",
      "Optimise foetal development",
      "Postpartum recovery roadmap",
    ],
    duration: "40 weeks + postpartum",
    accent: "from-rose-500/20 to-rose-500/5",
    category: "life-stage",
  },
  {
    slug: "child-nutrition",
    title: "Child Nutrition",
    icon: Apple,
    tagline: "Healthy habits from the first bite",
    problem:
      "Picky eating, hidden sugar and growth concerns leave parents unsure if their child is meeting milestones.",
    solution:
      "Age-banded meal plans with hidden-vegetable recipes, growth tracking and family-friendly cooking guides.",
    benefits: [
      "Age-appropriate growth tracking",
      "Picky-eater reversal strategies",
      "Hidden-veg recipe library",
      "Family meal frameworks",
    ],
    duration: "Ongoing",
    accent: "from-orange-500/20 to-orange-500/5",
    category: "life-stage",
  },
  {
    slug: "sports-nutrition",
    title: "Sports Nutrition",
    icon: Dumbbell,
    tagline: "Fuel performance, accelerate recovery",
    problem:
      "Generic advice fails athletes who need precision around training cycles, recovery and competition day.",
    solution:
      "Periodised nutrition synced with macro-cycles, intra-workout fuel and competition-day protocols.",
    benefits: [
      "Periodised fueling strategy",
      "Improve VO2 & power output",
      "Faster recovery between sessions",
      "Competition-day protocols",
    ],
    duration: "Season-long",
    accent: "from-cyan-500/20 to-cyan-500/5",
    category: "performance",
  },
  {
    slug: "corporate-wellness",
    title: "Corporate Wellness",
    icon: Users,
    tagline: "Healthier teams, sharper business",
    problem:
      "Sedentary work, stress eating and burnout erode productivity and inflate healthcare costs.",
    solution:
      "On-site & virtual wellness programmes with biometric screenings, workshops and 1:1 coaching.",
    benefits: [
      "Reduce absenteeism 22%",
      "Quarterly biometric screenings",
      "On-site & virtual workshops",
      "ROI reporting dashboard",
    ],
    duration: "Quarterly / annual",
    accent: "from-indigo-500/20 to-indigo-500/5",
    category: "corporate",
  },
  {
    slug: "body-composition",
    title: "Body Composition Analysis",
    icon: Zap,
    tagline: "Measure what actually matters",
    problem:
      "The scale hides the truth — muscle gain, fat loss and hydration shifts are invisible without proper analysis.",
    solution:
      "InBody 770 analysis with visceral fat, segmental lean mass and BMR insights, interpreted by a clinical dietitian.",
    benefits: [
      "Visceral fat measurement",
      "Segmental muscle analysis",
      "Resting metabolic rate",
      "60-minute clinical review",
    ],
    duration: "Single session",
    accent: "from-teal-500/20 to-teal-500/5",
    category: "performance",
  },
  {
    slug: "medical-nutrition-therapy",
    title: "Medical Nutrition Therapy",
    icon: Leaf,
    tagline: "Evidence-based nutrition for clinical conditions",
    problem:
      "Chronic conditions like hypertension, IBS, fatty liver and renal issues require precise dietary intervention.",
    solution:
      "Academy-funded MNT protocols delivered by RDN-credentialed clinicians with lab-synced adjustments.",
    benefits: [
      "Lab-synced protocol adjustments",
      "RDN-credentialed clinicians",
      "Condition-specific frameworks",
      "Physician collaboration",
    ],
    duration: "Ongoing",
    accent: "from-green-500/20 to-green-500/5",
    category: "medical",
  },
  {
    slug: "lifestyle-modification",
    title: "Lifestyle Modification",
    icon: HeartPulse,
    tagline: "Sleep, stress, movement — the missing 80%",
    problem:
      "Diet alone cannot outwork poor sleep, chronic stress or sedentary patterns — yet most plans ignore them.",
    solution:
      "Holistic coaching covering sleep architecture, stress regulation and movement integration alongside nutrition.",
    benefits: [
      "Sleep architecture optimisation",
      "Stress regulation protocols",
      "Movement integration coaching",
      "Habit-stacking framework",
    ],
    duration: "12 weeks",
    accent: "from-lime-500/20 to-lime-500/5",
    category: "weight",
  },
];

export type Program = {
  id: string;
  duration: string;
  days: number;
  price: number;
  originalPrice: number;
  tagline: string;
  popular?: boolean;
  features: string[];
  support: string[];
  accent: string;
};

export const programs: Program[] = [
  {
    id: "starter-30",
    duration: "30 Days",
    days: 30,
    price: 2999,
    originalPrice: 3999,
    tagline: "Kickstart your journey",
    features: [
      "1:1 consultation with RDN",
      "Personalised meal plan",
      "WhatsApp support (Mon–Fri)",
      "Body composition analysis",
      "Recipe library access",
    ],
    support: ["5 days/week chat", "1 follow-up session", "Email support"],
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    id: "transform-60",
    duration: "60 Days",
    days: 60,
    price: 5499,
    originalPrice: 7499,
    tagline: "Build momentum & habits",
    popular: true,
    features: [
      "Everything in Starter",
      "Bi-weekly 1:1 consultations",
      "Custom macro adjustments",
      "Progress photo tracking",
      "Habit coaching sessions",
      "Grocery list generator",
    ],
    support: ["6 days/week chat", "3 follow-up sessions", "Priority response"],
    accent: "from-emerald-600 to-teal-600",
  },
  {
    id: "lifestyle-90",
    duration: "90 Days",
    days: 90,
    price: 7999,
    originalPrice: 10999,
    tagline: "Lasting lifestyle transformation",
    features: [
      "Everything in Transform",
      "Weekly consultations",
      "CGM integration (if eligible)",
      "Lab review & adjustments",
      "Sleep & stress coaching",
      "Family meal planning",
    ],
    support: ["7 days/week chat", "6 follow-up sessions", "24h response"],
    accent: "from-teal-600 to-cyan-600",
  },
  {
    id: "deep-180",
    duration: "180 Days",
    days: 180,
    price: 13999,
    originalPrice: 19999,
    tagline: "Deep transformation & maintenance",
    features: [
      "Everything in Lifestyle",
      "Bi-weekly lab reviews",
      "Quarterly body composition",
      "Maintenance phase planning",
      "Mindful eating workshop",
      "Recipe customisation",
    ],
    support: ["7 days/week chat", "Unlimited messages", "Same-day response"],
    accent: "from-cyan-600 to-sky-600",
  },
  {
    id: "annual-365",
    duration: "365 Days",
    days: 365,
    price: 24999,
    originalPrice: 39999,
    tagline: "A full year of guided wellness",
    features: [
      "Everything in Deep Transformation",
      "Unlimited consultations",
      "Priority scheduling",
      "Annual health panel review",
      "Family access (up to 3)",
      "Concierge support",
    ],
    support: ["24/7 concierge", "Unlimited sessions", "Instant response"],
    accent: "from-sky-600 to-indigo-600",
  },
];

export type Dietitian = {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  experience: number;
  languages: string[];
  rating: number;
  reviews: number;
  bio: string;
  initials: string;
  accent: string;
  availability: string;
  focus: string[];
};

export const dietitians: Dietitian[] = [
  {
    id: "anita-shrestha",
    name: "Dr. Anita Shrestha",
    credentials: "RD, PhD Clinical Nutrition",
    specialty: "PCOS & Hormonal Health",
    experience: 14,
    languages: ["English", "Nepali", "Hindi"],
    rating: 4.97,
    reviews: 482,
    bio: "Dr. Shrestha leads our hormonal health practice, combining evidence-based medical nutrition therapy with a deeply empathetic coaching style.",
    initials: "AS",
    accent: "from-emerald-500 to-teal-500",
    availability: "Next available: Tomorrow, 10:00 AM",
    focus: ["PCOS", "Thyroid", "Fertility"],
  },
  {
    id: "rohan-thapa",
    name: "Dr. Rohan Thapa",
    credentials: "RD, CSCS, Sports Nutritionist",
    specialty: "Sports & Performance",
    experience: 11,
    languages: ["English", "Nepali"],
    rating: 4.95,
    reviews: 367,
    bio: "Former national team nutritionist, Dr. Thapa periodises fueling for endurance, strength and combat athletes — from amateur to Olympic-level.",
    initials: "RT",
    accent: "from-cyan-500 to-blue-500",
    availability: "Next available: Today, 4:30 PM",
    focus: ["Endurance", "Strength", "Combat sports"],
  },
  {
    id: "priya-gurung",
    name: "Priya Gurung",
    credentials: "RD, CDE (Diabetes Educator)",
    specialty: "Diabetes & Metabolic Health",
    experience: 9,
    languages: ["English", "Nepali", "Newari"],
    rating: 4.93,
    reviews: 298,
    bio: "A certified diabetes educator, Priya pairs CGM data with carb-counting mastery to help clients reverse pre-diabetes and stabilise type 2.",
    initials: "PG",
    accent: "from-sky-500 to-indigo-500",
    availability: "Next available: Tomorrow, 2:00 PM",
    focus: ["Type 2 Diabetes", "Pre-diabetes", "Insulin resistance"],
  },
  {
    id: "meera-rai",
    name: "Meera Rai",
    credentials: "RD, Maternal & Paediatric Nutrition",
    specialty: "Pregnancy & Child Nutrition",
    experience: 12,
    languages: ["English", "Nepali", "Maithili"],
    rating: 4.98,
    reviews: 421,
    bio: "Meera guides mothers through every trimester and beyond, with a gentle, family-centred approach that makes healthy eating feel doable.",
    initials: "MR",
    accent: "from-rose-500 to-pink-500",
    availability: "Next available: Today, 11:00 AM",
    focus: ["Pregnancy", "Lactation", "Child nutrition"],
  },
];

export type Testimonial = {
  id: string;
  name: string;
  age: number;
  city: string;
  condition: string;
  rating: number;
  beforeWeight: number;
  afterWeight: number;
  duration: string;
  quote: string;
  highlight: string;
  initials: string;
  accent: string;
  tag: "weight-loss" | "pcos" | "diabetes" | "sports" | "pregnancy" | "thyroid";
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sneha K.",
    age: 29,
    city: "Kathmandu",
    condition: "PCOS",
    rating: 5,
    beforeWeight: 78,
    afterWeight: 67,
    duration: "16 weeks",
    quote:
      "After years of irregular cycles and weight that wouldn't budge, Dr. Shrestha's protocol gave me my life back. My cycles are regular, my skin cleared up, and I lost 11 kg without feeling deprived.",
    highlight: "-11 kg in 16 weeks",
    initials: "SK",
    accent: "from-pink-500 to-rose-500",
    tag: "pcos",
  },
  {
    id: "t2",
    name: "Bishal T.",
    age: 42,
    city: "Lalitpur",
    condition: "Type 2 Diabetes",
    rating: 5,
    beforeWeight: 92,
    afterWeight: 81,
    duration: "24 weeks",
    quote:
      "My HbA1c dropped from 8.4 to 6.1 and my doctor took me off metformin. The CGM integration was a game changer — I finally understood how my body responds to food.",
    highlight: "HbA1c 8.4 → 6.1",
    initials: "BT",
    accent: "from-sky-500 to-blue-500",
    tag: "diabetes",
  },
  {
    id: "t3",
    name: "Anjali M.",
    age: 34,
    city: "Bhaktapur",
    condition: "Postpartum Weight",
    rating: 5,
    beforeWeight: 72,
    afterWeight: 60,
    duration: "20 weeks",
    quote:
      "Meera supported me through my second pregnancy and postpartum recovery. I'm now lighter than my pre-pregnancy weight and have more energy than I did in my twenties.",
    highlight: "-12 kg postpartum",
    initials: "AM",
    accent: "from-rose-500 to-pink-500",
    tag: "pregnancy",
  },
  {
    id: "t4",
    name: "Prakash R.",
    age: 27,
    city: "Pokhara",
    condition: "Athlete Recomp",
    rating: 5,
    beforeWeight: 68,
    afterWeight: 72,
    duration: "12 weeks",
    quote:
      "Dr. Thapa dialled in my race-day fueling and I dropped my marathon PB by 14 minutes. The 4 kg I gained is all lean mass. I've never felt this strong.",
    highlight: "+4 kg lean mass",
    initials: "PR",
    accent: "from-cyan-500 to-blue-500",
    tag: "sports",
  },
  {
    id: "t5",
    name: "Rekha S.",
    age: 38,
    city: "Kathmandu",
    condition: "Hypothyroidism",
    rating: 5,
    beforeWeight: 85,
    afterWeight: 75,
    duration: "18 weeks",
    quote:
      "My energy is back, my brain fog has lifted, and I've lost 10 kg. The thyroid-specific meal timing made a huge difference — I wish I'd found this years ago.",
    highlight: "-10 kg + energy restored",
    initials: "RS",
    accent: "from-violet-500 to-purple-500",
    tag: "thyroid",
  },
  {
    id: "t6",
    name: "Suman B.",
    age: 31,
    city: "Chitwan",
    condition: "Weight Loss",
    rating: 5,
    beforeWeight: 96,
    afterWeight: 78,
    duration: "32 weeks",
    quote:
      "I'd tried every diet under the sun. This was the first time I lost weight without gaining it back. The behavioural coaching rewired my relationship with food.",
    highlight: "-18 kg kept off",
    initials: "SB",
    accent: "from-emerald-500 to-teal-500",
    tag: "weight-loss",
  },
];

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readingTime: number;
  tags: string[];
  accent: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "The Truth About PCOS and Carbohydrates: What 2025 Research Tells Us",
    excerpt:
      "PCOS isn't a carbs problem — it's an insulin problem. Here's how to build a low-glycaemic plate that actually works for hormonal balance, with evidence from 12 recent RCTs.",
    category: "Hormonal Health",
    author: "Dr. Anita Shrestha",
    date: "2025-06-18",
    readingTime: 8,
    tags: ["PCOS", "Insulin", "Carbohydrates"],
    accent: "from-pink-500 to-rose-500",
    featured: true,
  },
  {
    id: "b2",
    title: "Continuous Glucose Monitoring for Non-Diabetics: Hype or Helpful?",
    excerpt:
      "CGMs are everywhere — but is the data actually actionable for someone without diabetes? We break down what's useful, what's noise, and who should consider wearing one.",
    category: "Metabolic Health",
    author: "Priya Gurung",
    date: "2025-06-12",
    readingTime: 6,
    tags: ["CGM", "Glucose", "Metabolism"],
    accent: "from-sky-500 to-blue-500",
  },
  {
    id: "b3",
    title: "5 Evidence-Based Strategies to Fix Emotional Eating",
    excerpt:
      "Willpower is not a strategy. Drawing on CBT and habit science, here are five practical tools our dietitians use with clients to break the binge-restrict cycle for good.",
    category: "Behavioural Nutrition",
    author: "Meera Rai",
    date: "2025-06-05",
    readingTime: 7,
    tags: ["Mindful eating", "CBT", "Habits"],
    accent: "from-emerald-500 to-teal-500",
  },
  {
    id: "b4",
    title: "Pre-Workout Nutrition for Endurance Athletes: A Periodised Approach",
    excerpt:
      "From fasted easy sessions to race-day carb loading, learn how to fuel each training block for maximum adaptation and minimum gastrointestinal distress.",
    category: "Sports Nutrition",
    author: "Dr. Rohan Thapa",
    date: "2025-05-28",
    readingTime: 9,
    tags: ["Endurance", "Performance", "Carb loading"],
    accent: "from-cyan-500 to-blue-500",
  },
];

export type FAQ = {
  question: string;
  answer: string;
  category: string;
};

export const faqs: FAQ[] = [
  {
    question: "Do I need a referral from my doctor to book a consultation?",
    answer:
      "No referral is required for most services. However, if you are booking for Medical Nutrition Therapy (diabetes, thyroid, hypertension, etc.), we may request recent lab reports to design the most effective protocol. Our intake form will guide you through what to bring.",
    category: "Booking",
  },
  {
    question: "Are consultations available online or only in-clinic?",
    answer:
      "Both. All our dietitians offer secure video consultations via the platform, and in-clinic appointments are available at our Kathmandu location for body composition analysis and hands-on assessments. Video consultations are equally effective for most conditions.",
    category: "Booking",
  },
  {
    question: "How quickly will I see results?",
    answer:
      "Most clients notice energy and digestion improvements within 2–3 weeks. Measurable changes in weight, body composition and lab markers typically appear between weeks 4–8, with the most significant transformations happening between weeks 12–24. Sustainable progress beats rapid loss every time.",
    category: "Results",
  },
  {
    question: "What if I don't like the meal plan?",
    answer:
      "Your meal plan is fully customisable. We build around foods you already enjoy, with smart swaps to improve nutrition. If something isn't working, your dietitian will revise it — typically within 24 hours. The platform also includes 200+ recipes you can swap in.",
    category: "Programs",
  },
  {
    question: "Do you accept insurance?",
    answer:
      "We currently partner with several major insurers for Medical Nutrition Therapy sessions. Coverage varies by provider and plan. Our team will verify your benefits before your first appointment and provide an itemised receipt you can submit for reimbursement.",
    category: "Payments",
  },
  {
    question: "Can I cancel or pause my program?",
    answer:
      "Yes. Programs can be paused for up to 60 days for travel, illness or personal reasons — just notify your dietitian. Cancellations within the first 14 days are fully refundable minus the consultation fee. After 14 days, unused sessions remain valid for 12 months.",
    category: "Programs",
  },
  {
    question: "Is my health data secure and private?",
    answer:
      "Absolutely. We are HIPAA-aligned and GDPR-compliant. All health data is encrypted at rest and in transit, stored on ISO 27001-certified infrastructure, and never shared with third parties without your explicit consent. You can export or delete your data at any time.",
    category: "Privacy",
  },
  {
    question: "Do you offer family or corporate plans?",
    answer:
      "Yes. Our 365-day program includes access for up to 3 family members. For corporate wellness, we offer quarterly and annual contracts with biometric screenings, workshops and 1:1 coaching — please contact our team for a custom proposal and ROI model.",
    category: "Programs",
  },
];

export type Stat = {
  label: string;
  value: string;
  suffix?: string;
  description: string;
};

export const stats: Stat[] = [
  {
    label: "Lives transformed",
    value: "12,400",
    description: "Clients who completed a The Dietitian's Clinic program",
  },
  {
    label: "Avg. weight lost",
    value: "8.4",
    suffix: "kg",
    description: "Across all 90-day completers in 2024",
  },
  {
    label: "Client satisfaction",
    value: "97",
    suffix: "%",
    description: "Would recommend The Dietitian's Clinic to a friend",
  },
  {
    label: "Certified dietitians",
    value: "28",
    description: "RDN-credentialed clinicians on staff",
  },
];

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
  duration: string;
  icon: LucideIcon;
};

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Discovery Call",
    description:
      "A free 15-minute call to understand your goals, history and timeline. We match you with the right dietitian and program.",
    duration: "15 min · Free",
    icon: Users,
  },
  {
    step: 2,
    title: "Comprehensive Assessment",
    description:
      "60–90 minute deep-dive covering labs, body composition, lifestyle, food preferences and behavioural patterns.",
    duration: "90 min · In-clinic or video",
    icon: Activity,
  },
  {
    step: 3,
    title: "Personalised Plan & Coaching",
    description:
      "Receive a custom meal plan, supplement protocol and habit roadmap. Weekly check-ins keep you accountable.",
    duration: "Ongoing · Daily support",
    icon: HeartPulse,
  },
  {
    step: 4,
    title: "Track, Adjust, Transform",
    description:
      "Monitor progress with our dashboard. Your dietitian adjusts protocols based on real data — not guesswork.",
    duration: "12+ weeks",
    icon: TrendingUp,
  },
];
