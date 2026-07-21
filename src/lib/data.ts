import {
  Activity,
  Apple,
  Baby,
  Dumbbell,
  GraduationCap,
  Globe,
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
    title: "PMOS Nutrition",
    icon: Heart,
    tagline: "Balance hormones with food",
    problem:
      "Insulin resistance, irregular cycles and weight gain from PMOS disrupt daily life and long-term health.",
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
    accent: "from-emerald-500/20 to-emerald-500/5",
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
    accent: "from-emerald-500/20 to-teal-500/5",
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
  {
    slug: "school-nutrition",
    title: "School Nutrition",
    icon: GraduationCap,
    tagline: "Building healthy eaters from the cafeteria up",
    problem:
      "Rising childhood obesity, junk food availability, and poor dietary habits in school environments impact lifelong health and academic performance.",
    solution:
      "Partnerships with schools to design nutritious meal programs, educate students on healthy eating, and create policies that promote wellness.",
    benefits: [
      "Cafeteria menu design",
      "Student nutrition education",
      "Parent awareness workshops",
      "Wellness policy consultation",
    ],
    duration: "Term/Annual",
    accent: "from-emerald-500/20 to-emerald-500/5",
    category: "life-stage",
  },
  {
    slug: "healthy-aging",
    title: "Healthy Aging",
    icon: HeartPulse,
    tagline: "Nutrition for vitality in your 50s, 60s and beyond",
    problem:
      "Muscle loss, bone density decline, and metabolic slowdown make aging harder — but targeted nutrition can add life to your years.",
    solution:
      "Age-specific nutrition focusing on protein intake, calcium, vitamin D, and anti-inflammatory foods to maintain independence and energy.",
    benefits: [
      "Sarcopenia prevention",
      "Bone health optimization",
      "Cognitive health support",
      "Anti-inflammatory meal planning",
    ],
    duration: "Ongoing",
    accent: "from-purple-500/20 to-purple-500/5",
    category: "life-stage",
  },
  {
    slug: "public-health-nutrition",
    title: "Public Health Nutrition",
    icon: Globe,
    tagline: "Community-level nutrition education and advocacy",
    problem:
      "Misinformation, lack of access, and poor awareness prevent communities from making informed dietary choices.",
    solution:
      "Evidence-based nutrition workshops, community programs, and digital content to improve public health literacy at scale.",
    benefits: [
      "Community nutrition workshops",
      "Digital health content",
      "Corporate wellness talks",
      "Policy and advocacy support",
    ],
    duration: "Flexible",
    accent: "from-emerald-500/20 to-teal-500/5",
    category: "corporate",
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
    accent: "from-emerald-600 to-teal-600",
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
    specialty: "PMOS & Hormonal Health",
    experience: 14,
    languages: ["English", "Nepali", "Hindi"],
    rating: 4.97,
    reviews: 482,
    bio: "Dr. Shrestha leads our hormonal health practice, combining evidence-based medical nutrition therapy with a deeply empathetic coaching style.",
    initials: "AS",
    accent: "from-emerald-500 to-teal-500",
    availability: "Next available: Tomorrow, 10:00 AM",
    focus: ["PMOS", "Thyroid", "Fertility"],
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
    accent: "from-teal-500 to-cyan-500",
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
    accent: "from-emerald-500 to-teal-500",
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
    city: "Dharan",
    condition: "PMOS",
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
    accent: "from-emerald-500 to-teal-500",
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
    accent: "from-teal-500 to-cyan-500",
    tag: "sports",
  },
  {
    id: "t5",
    name: "Rekha S.",
    age: 38,
    city: "Dharan",
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
    title: "The Truth About PMOS and Carbohydrates: What 2025 Research Tells Us",
    excerpt:
      "PMOS isn't a carbs problem — it's an insulin problem. Here's how to build a low-glycaemic plate that actually works for hormonal balance, with evidence from 12 recent RCTs.",
    category: "Hormonal Health",
    author: "Dr. Anita Shrestha",
    date: "2025-06-18",
    readingTime: 8,
    tags: ["PMOS", "Insulin", "Carbohydrates"],
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
    accent: "from-emerald-500 to-teal-500",
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
    accent: "from-teal-500 to-cyan-500",
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
      "Both. All our dietitians offer secure video consultations via the platform, and in-clinic appointments are available at our Dharan location for body composition analysis and hands-on assessments. Video consultations are equally effective for most conditions.",
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
    description: "Clients who completed a Ashish Nutrition Clinic program",
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
    description: "Would recommend Ashish Nutrition Clinic to a friend",
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

export type WhyChooseUsItem = {
  title: string;
  description: string;
};

export const whyChooseUs: WhyChooseUsItem[] = [
  {
    title: "Individualized Nutrition Counseling",
    description: "Every plan is built from scratch around your unique biology, goals, food preferences, and lifestyle — never a template.",
  },
  {
    title: "Evidence-Based Recommendations",
    description: "Our protocols are grounded in peer-reviewed research and clinical guidelines, not fads or trends.",
  },
  {
    title: "Locally Available Foods",
    description: "Meal plans use foods you can actually find in your local market — no imported superfoods or hard-to-source ingredients.",
  },
  {
    title: "Sustainable Lifestyle Changes",
    description: "We focus on habits you can maintain for life, not crash diets that leave you rebounding heavier than before.",
  },
  {
    title: "Regular Follow-up & Accountability",
    description: "Scheduled check-ins keep you on track. Your dietitian adjusts your plan based on real progress data.",
  },
  {
    title: "Compassionate, Judgment-Free Care",
    description: "Whatever your starting point, you'll be met with empathy and respect — never shame or guilt.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Initial Consultation",
    description:
      "A free 15-minute call to discuss your health goals, concerns, and what you hope to achieve. We'll determine if our clinic is the right fit for you.",
    duration: "15 min · Free",
    icon: Users,
  },
  {
    step: 2,
    title: "Comprehensive Assessment",
    description:
      "A thorough 60–90 minute evaluation of your dietary habits, lifestyle, medical history, and lab results to understand your unique needs.",
    duration: "90 min · In-clinic or video",
    icon: Activity,
  },
  {
    step: 3,
    title: "Personalized Nutrition Plan",
    description:
      "Receive a custom nutrition plan tailored to your goals, food preferences, and lifestyle — using locally available foods and practical meal ideas.",
    duration: "Within 48 hours",
    icon: HeartPulse,
  },
  {
    step: 4,
    title: "Follow-up & Progress Monitoring",
    description:
      "Regular check-ins to track your progress, adjust your plan as needed, and provide ongoing support and accountability to ensure lasting results.",
    duration: "Ongoing · Weekly to monthly",
    icon: TrendingUp,
  },
];

// ===== Extended data for individual pages =====

export type ServiceDetail = {
  slug: string;
  process: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
  outcomes: { metric: string; value: string }[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "weight-loss": {
    slug: "weight-loss",
    process: [
      { step: 1, title: "Metabolic assessment", description: "We measure your BMR, body composition and metabolic markers to set a precise calorie target." },
      { step: 2, title: "Personalised meal architecture", description: "High-protein, high-fibre meal plan built around foods you already love — with smart swaps." },
      { step: 3, title: "Behavioural coaching", description: "Weekly 30-minute sessions address emotional eating, sleep, stress and habit loops." },
      { step: 4, title: "Progressive adjustment", description: "Every 2 weeks we recalibrate macros based on real weight, energy and adherence data." },
    ],
    faqs: [
      { question: "How fast will I lose weight?", answer: "Our average client loses 0.5–0.8 kg per week. We prioritise fat loss over lean mass, which means slower but sustainable progress." },
      { question: "Do I have to count calories?", answer: "Not necessarily. We offer both macro-tracking and intuitive-eating tracks depending on your personality and goals." },
      { question: "What if I hit a plateau?", answer: "Plateaus are normal. Your dietitian will adjust calories, macros, NEAT protocols and stress factors to break through." },
    ],
    relatedSlugs: ["lifestyle-modification", "body-composition", "pcos-diet"],
    outcomes: [
      { metric: "Average weight loss", value: "8.4 kg" },
      { metric: "Waist reduction", value: "6.2 cm" },
      { metric: "Body fat drop", value: "4.8%" },
      { metric: "Adherence rate", value: "92%" },
    ],
  },
  "pcos-diet": {
    slug: "pcos-diet",
    process: [
      { step: 1, title: "Hormonal panel review", description: "We analyse recent labs (testosterone, LH/FSH, insulin, glucose) and symptom patterns." },
      { step: 2, title: "Low-GI meal architecture", description: "Anti-inflammatory, low-glycaemic-load meals with chromium and inositol-rich foods." },
      { step: 3, title: "Lifestyle layer", description: "Sleep, stress and movement protocols that lower insulin resistance and androgen load." },
      { step: 4, title: "Cycle tracking & adjustment", description: "We sync nutrition with your cycle phases and adjust based on symptom changes." },
    ],
    faqs: [
      { question: "Can PMOS be managed with diet alone?", answer: "For many women, yes — particularly with insulin-resistant PMOS. Some cases benefit from adjunct supplements or medications, which we coordinate with your physician." },
      { question: "Will this help with fertility?", answer: "Yes. Improving insulin sensitivity and reducing inflammation significantly improves ovulation regularity and fertility outcomes." },
      { question: "How long until I see cycle improvements?", answer: "Most clients see cycle changes within 8–12 weeks of consistent adherence." },
    ],
    relatedSlugs: ["weight-loss", "diabetes-diet", "lifestyle-modification"],
    outcomes: [
      { metric: "Cycle regularity", value: "+74%" },
      { metric: "Insulin resistance", value: "-31%" },
      { metric: "Weight loss", value: "6.8 kg" },
      { metric: "Skin improvements", value: "68%" },
    ],
  },
  "diabetes-diet": {
    slug: "diabetes-diet",
    process: [
      { step: 1, title: "Glycaemic baseline", description: "HbA1c, fasting glucose, CGM baseline (if eligible) and medication review." },
      { step: 2, title: "Carb-counted meal plan", description: "Precision carbohydrate counting with fibre-forward food choices and timing optimisation." },
      { step: 3, title: "CGM-guided personalisation", description: "Wear a CGM for 14 days to identify your personal glucose triggers and refine the plan." },
      { step: 4, title: "Medication coordination", description: "We collaborate with your endocrinologist to safely reduce medication as markers improve." },
    ],
    faqs: [
      { question: "Can I reverse type 2 diabetes?", answer: "Many people with type 2 diabetes can achieve remission (HbA1c < 6.5% without medication) through sustained weight loss and dietary change. We've helped clients do exactly this." },
      { question: "Do I need a CGM?", answer: "For type 1 and type 2 diabetes, CGMs are transformative. For pre-diabetes, they're optional but highly educational for the first 14 days." },
      { question: "Will this work with my insulin?", answer: "Absolutely. We coordinate timing and carb ratios with your prescribing physician to keep you safe." },
    ],
    relatedSlugs: ["weight-loss", "thyroid-diet", "medical-nutrition-therapy"],
    outcomes: [
      { metric: "HbA1c reduction", value: "-1.6%" },
      { metric: "Fasting glucose", value: "-32 mg/dL" },
      { metric: "Medication reduction", value: "57%" },
      { metric: "Energy improvement", value: "81%" },
    ],
  },
  "sports-nutrition": {
    slug: "sports-nutrition",
    process: [
      { step: 1, title: "Performance audit", description: "Training load, current fueling, recovery metrics and competition calendar review." },
      { step: 2, title: "Periodised fueling plan", description: "Macro-cycle synced nutrition: endurance, hypertrophy, peaking and taper phases." },
      { step: 3, title: "Intra & recovery protocols", description: "Hydration, electrolyte, intra-workout carb and post-session recovery windows." },
      { step: 4, title: "Competition day protocol", description: "Pre-race meal, during-event fueling and post-competition recovery plan." },
    ],
    faqs: [
      { question: "Do you work with endurance athletes?", answer: "Yes — marathoners, ultra-runners, cyclists and triathletes. We're trained in CHO periodisation and gut training for race-day fueling." },
      { question: "Can you help with strength sports?", answer: "Powerlifting, Olympic lifting and bodybuilding. We handle weigh-cuts, hypertrophy phases and peak week protocols." },
      { question: "What about combat sports?", answer: "Yes. Safe weight cuts for MMA, boxing and wrestling with full rehydration protocols." },
    ],
    relatedSlugs: ["body-composition", "weight-gain", "lifestyle-modification"],
    outcomes: [
      { metric: "VO2 improvement", value: "+12%" },
      { metric: "Power output", value: "+9%" },
      { metric: "Recovery time", value: "-23%" },
      { metric: "Race PB drop", value: "8.4%" },
    ],
  },
};

// Generic fallback for services without specific detail
export function getServiceDetail(slug: string): ServiceDetail {
  return serviceDetails[slug] || {
    slug,
    process: [
      { step: 1, title: "Initial consultation", description: "60–90 minute deep-dive assessment covering your history, goals, lifestyle and labs." },
      { step: 2, title: "Personalised protocol", description: "A custom meal plan, supplement framework and habit roadmap built around your reality." },
      { step: 3, title: "Coaching & accountability", description: "Weekly check-ins with your dietitian, plus unlimited messaging between sessions." },
      { step: 4, title: "Track & adjust", description: "We monitor progress and refine your protocol every 2–4 weeks based on real data." },
    ],
    faqs: [
      { question: "How long until I see results?", answer: "Most clients notice energy and digestion improvements in 2–3 weeks, with measurable changes in 4–8 weeks." },
      { question: "Is the plan flexible?", answer: "Absolutely. Your plan is fully customisable and your dietitian will revise it as needed, typically within 24 hours." },
      { question: "Do you offer online consultations?", answer: "Yes — all our dietitians offer secure video consultations, which are equally effective for most conditions." },
    ],
    relatedSlugs: services.filter((s) => s.slug !== slug).slice(0, 3).map((s) => s.slug),
    outcomes: [
      { metric: "Client satisfaction", value: "97%" },
      { metric: "Goal achievement", value: "89%" },
      { metric: "Adherence rate", value: "92%" },
      { metric: "6-month retention", value: "78%" },
    ],
  };
}

// ===== Extended team members for About page =====

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  credentials: string;
  bio: string;
  initials: string;
  accent: string;
  specialties: string[];
  yearsExperience: number;
};

export const teamMembers: TeamMember[] = [
  {
    id: "anita-shrestha",
    name: "Dr. Anita Shrestha",
    role: "Founder & Clinical Director",
    credentials: "RD, PhD Clinical Nutrition",
    bio: "Anita founded Ashish Nutrition Clinic in 2018 after a decade in hospital dietetics. She leads our hormonal health practice and oversees clinical quality across the team.",
    initials: "AS",
    accent: "from-emerald-500 to-teal-500",
    specialties: ["PMOS", "Thyroid", "Fertility"],
    yearsExperience: 14,
  },
  {
    id: "rohan-thapa",
    name: "Dr. Rohan Thapa",
    role: "Head of Sports Nutrition",
    credentials: "RD, CSCS, Sports Nutritionist",
    bio: "Former national team nutritionist, Rohan periodises fueling for endurance, strength and combat athletes from amateur to Olympic level.",
    initials: "RT",
    accent: "from-teal-500 to-cyan-500",
    specialties: ["Endurance", "Strength", "Combat sports"],
    yearsExperience: 11,
  },
  {
    id: "priya-gurung",
    name: "Priya Gurung",
    role: "Senior Diabetes Educator",
    credentials: "RD, CDE",
    bio: "A certified diabetes educator, Priya pairs CGM data with carb-counting mastery to help clients reverse pre-diabetes and stabilise type 2 diabetes.",
    initials: "PG",
    accent: "from-emerald-500 to-teal-500",
    specialties: ["Type 2 Diabetes", "Pre-diabetes", "Insulin resistance"],
    yearsExperience: 9,
  },
  {
    id: "meera-rai",
    name: "Meera Rai",
    role: "Maternal & Paediatric Lead",
    credentials: "RD, Maternal & Paediatric Nutrition",
    bio: "Meera guides mothers through every trimester and beyond, with a gentle, family-centred approach that makes healthy eating feel doable.",
    initials: "MR",
    accent: "from-rose-500 to-pink-500",
    specialties: ["Pregnancy", "Lactation", "Child nutrition"],
    yearsExperience: 12,
  },
  {
    id: "aarav-kc",
    name: "Aarav K.C.",
    role: "Head of Operations",
    credentials: "MBA, B.Tech",
    bio: "Aarav keeps the clinic running smoothly — from technology to scheduling to client experience. Previously at two health-tech startups.",
    initials: "AK",
    accent: "from-amber-500 to-orange-500",
    specialties: ["Operations", "Technology", "Client experience"],
    yearsExperience: 8,
  },
  {
    id: "sita-maharjan",
    name: "Sita Maharjan",
    role: "Lead Receptionist & Care Coordinator",
    credentials: "B.Sc. Nursing",
    bio: "Sita is often the first voice you'll hear on the phone. She's a nursing graduate with a gift for making anxious new clients feel at home.",
    initials: "SM",
    accent: "from-violet-500 to-purple-500",
    specialties: ["Client onboarding", "Scheduling", "Care coordination"],
    yearsExperience: 6,
  },
];

// ===== Extended blog content =====

export type BlogArticle = BlogPost & {
  content: { heading: string; body: string }[];
  authorBio: string;
  authorInitials: string;
  authorAccent: string;
};

export const blogArticles: BlogArticle[] = [
  {
    ...blogPosts[0],
    authorBio: "Dr. Anita Shrestha is the Founder & Clinical Director of Ashish Nutrition Clinic. She holds a PhD in Clinical Nutrition and has 14 years of experience in hormonal health.",
    authorInitials: "AS",
    authorAccent: "from-emerald-500 to-teal-500",
    content: [
      {
        heading: "The insulin-PMOS connection",
        body: "Polycystic Ovary Syndrome affects approximately 1 in 10 women of reproductive age worldwide, and insulin resistance is present in 70–80% of those cases. When insulin levels are chronically elevated, the ovaries respond by producing more androgens — which worsens every other PMOS symptom, from irregular cycles to weight gain to acne. This is why targeting insulin sensitivity, rather than simply restricting calories, is the cornerstone of evidence-based PMOS nutrition therapy. A 2024 meta-analysis in the Journal of Clinical Endocrinology & Metabolism confirmed that low-glycaemic-load diets improve both metabolic and reproductive outcomes in PMOS more effectively than iso-caloric high-GI controls.",
      },
      {
        heading: "Why carbohydrates are not the enemy",
        body: "The internet would have you believe that women with PMOS must adopt strict keto or carnivore protocols. The evidence tells a different story. Fibre-rich, low-glycaemic carbohydrates — think lentils, chickpeas, sweet potatoes, oats, berries and most whole fruits — actually improve insulin sensitivity over time. The problem isn't carbs; it's the dose, the timing, the processing and the company they keep. A bowl of white rice with grilled chicken and vegetables will spike glucose far less than the same rice alone. Pairing, processing and portion matter more than elimination.",
      },
      {
        heading: "Ashish Nutrition Clinic PMOS framework",
        body: "Our clinical protocol rests on four pillars. First, we build meals around a low-glycaemic-load architecture with 25–30g of protein per meal. Second, we incorporate chromium and inositol-rich foods (and supplement where appropriate). Third, we sync movement — particularly post-meal walks and resistance training — to lower postprandial glucose. Fourth, we address the often-overlooked lifestyle factors: sleep architecture, stress regulation and circadian alignment. Most clients see cycle regularity improve within 8–12 weeks, with weight loss following naturally as insulin levels normalise.",
      },
      {
        heading: "What to expect in the first 90 days",
        body: "Weeks 1–2 are about transition — your body is adjusting to a new metabolic rhythm, and you may feel some fatigue as insulin levels begin to drop. Weeks 3–6 are when energy typically rebounds and cravings diminish significantly. By week 8, most clients report clearer skin, more regular cycles and noticeable fat loss around the midsection. By week 12, lab markers begin to shift in measurable ways: lower fasting insulin, improved HbA1c and balanced LH/FSH ratios. The journey is not linear, but it is reliably transformative when the protocol is followed consistently.",
      },
    ],
  },
  {
    ...blogPosts[1],
    authorBio: "Priya Gurung is a Senior Diabetes Educator at Ashish Nutrition Clinic. She is a Certified Diabetes Educator (CDE) with 9 years of clinical experience.",
    authorInitials: "PG",
    authorAccent: "from-emerald-500 to-teal-500",
    content: [
      {
        heading: "What CGMs actually measure",
        body: "Continuous Glucose Monitors use a tiny filament inserted under the skin to measure interstitial glucose every 1–5 minutes. This provides a near-continuous picture of how your body responds to food, stress, sleep and movement throughout the day. The data is genuinely valuable — but only if you know how to interpret it. A single high reading after a meal is not a crisis; what matters is the pattern, the area under the curve, and how quickly glucose returns to baseline. Without context, CGM data can create anxiety rather than insight.",
      },
      {
        heading: "When CGMs make sense for non-diabetics",
        body: "For people with pre-diabetes, insulin resistance, PMOS or a strong family history of metabolic disease, a 14-day CGM trial can be genuinely illuminating. It reveals which foods cause unexpected spikes, how sleep affects your fasting glucose, and how exercise improves your glucose tolerance. For otherwise healthy people with no metabolic risk factors, however, the actionable insights are usually fewer — and the risk of obsessive tracking outweighs the benefits. We recommend CGMs selectively, not universally.",
      },
      {
        heading: "How we use CGM data at Ashish Nutrition Clinic",
        body: "When a client wears a CGM, we don't just glance at the graphs. We pair the data with a detailed food and activity log to identify personalised triggers — that mid-morning latte that spikes you to 180, the walk after dinner that flattens your overnight curve, the poor night's sleep that elevates your fasting glucose by 15 points. This data lets us move beyond population-level advice and craft a truly personalised protocol. Most clients are surprised by at least one finding: a 'healthy' food that spikes them, or a 'bad' food they tolerate well.",
      },
    ],
  },
  {
    ...blogPosts[2],
    authorBio: "Meera Rai leads Maternal & Paediatric Nutrition at Ashish Nutrition Clinic. She has 12 years of experience guiding families through pregnancy and early childhood.",
    authorInitials: "MR",
    authorAccent: "from-rose-500 to-pink-500",
    content: [
      {
        heading: "Willpower is a finite resource",
        body: "Research from Roy Baumeister and others has consistently shown that willpower behaves like a muscle — it fatigues with use. By the end of a stressful workday, the resolve that felt unshakeable at breakfast has often evaporated. This is why restrictive diets fail predictably in the evening hours, and why behavioural scientists have shifted toward environmental and habit-based approaches. Rather than asking 'how do I resist the brownie?', the better question is 'how do I design my environment so the brownie isn't there — or so I've already eaten something satisfying?'",
      },
      {
        heading: "The habit loop: cue, routine, reward",
        body: "Charles Duhigg's habit loop — cue, routine, reward — is the foundation of modern behaviour change. Emotional eating typically follows a predictable loop: stress (cue) → eat comfort food (routine) → temporary relief (reward). To change the behaviour, you don't eliminate the cue (you can't avoid stress) and you can't easily eliminate the reward (your brain craves relief). What you can do is substitute the routine: stress → call a friend, take a 10-minute walk, or do a breathing exercise → relief. Over time, the new routine becomes the default response.",
      },
      {
        heading: "Five practical strategies we use with clients",
        body: "First, the 'delay don't deny' rule: when a craving hits, wait 15 minutes before acting — most cravings fade. Second, environment design: keep trigger foods out of the house; you can't eat what isn't there. Third, the 'crowding out' approach: focus on adding nourishing foods rather than restricting treats. Fourth, urge surfing: notice the craving as a physical sensation, watch it rise and fall without acting. Fifth, identity-based habit change: 'I am someone who takes care of my body' is more powerful than 'I shouldn't eat that'. These tools, practised consistently, rewire the relationship with food over months — not days.",
      },
    ],
  },
  {
    ...blogPosts[3],
    authorBio: "Dr. Rohan Thapa leads Sports Nutrition at Ashish Nutrition Clinic. He is a former national team nutritionist with 11 years of elite-athlete experience.",
    authorInitials: "RT",
    authorAccent: "from-teal-500 to-cyan-500",
    content: [
      {
        heading: "Periodisation: matching fuel to the training block",
        body: "Endurance nutrition is not one-size-fits-all. A marathoner in base-building phase needs different fueling than the same athlete in taper week or race week. Periodised nutrition matches carbohydrate availability to training load: high-carb days on hard session days, low-carb days on easy days, and strategic 'train low' sessions to stimulate mitochondrial adaptation. This 'fuel for the work required' model, pioneered by researchers like James Morton at Liverpool John Moores University, has become the gold standard for elite endurance fueling.",
      },
      {
        heading: "Pre-workout: less is more for easy sessions",
        body: "For easy aerobic sessions under 75 minutes, you don't need pre-workout carbs — in fact, training in a fasted or low-glycogen state can stimulate adaptations. For sessions over 90 minutes or any high-intensity work, however, pre-fueling matters. A simple rule of thumb: 1g of carbohydrate per kg of body weight, 1–3 hours before. For a 65kg runner, that's a bowl of oats with banana and honey, eaten 2 hours before. Avoid high-fibre and high-fat foods in the 90 minutes before hard efforts — they slow gastric emptying and can cause distress.",
      },
      {
        heading: "Race-day fueling: the 60-90g/hour rule",
        body: "For events lasting longer than 2 hours, aim for 60–90g of carbohydrate per hour — a threshold supported by decades of sports science. This is more than most amateurs consume, and it requires gut training (practicing fueling in long sessions) to tolerate. Use multiple transportable carbohydrates (glucose + fructose in a 2:1 ratio) to exceed the 60g/hour single-source limit. For a marathon, that means 2–3 gels per hour plus sports drink, practiced religiously in the final 6 weeks of training. Never try anything new on race day.",
      },
      {
        heading: "Recovery: the 30-minute window, demystified",
        body: "The 'anabolic window' is less narrow than once believed, but post-session nutrition still matters — especially after hard or long sessions. Aim for 0.3g protein per kg body weight within 2 hours, plus 1–1.2g carbohydrate per kg to begin glycogen replenishment. For a 65kg athlete: 20g protein and 65g carbs — a chicken sandwich and a banana, or a recovery shake and a bowl of cereal. Hydration matters too: replace 1.5x the fluid lost (weigh yourself pre/post to estimate), with electrolytes for sessions over 90 minutes or in heat.",
      },
    ],
  },
];

export function getBlogArticle(id: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.id === id);
}

// ===== Awards & certifications for About page =====

export type Award = {
  year: string;
  title: string;
  organisation: string;
  description: string;
};

export const awards: Award[] = [
  { year: "2024", title: "Best Digital Health Startup", organisation: "Nepal Startup Awards", description: "Recognised for innovation in personalised nutrition care." },
  { year: "2023", title: "Healthcare Excellence Award", organisation: "Nepal Medical Association", description: "For outstanding contribution to preventive healthcare." },
  { year: "2023", title: "Top 10 Women-Led Health Companies", organisation: "Forbes Nepal", description: "Featured under Dr. Anita Shrestha's leadership." },
  { year: "2022", title: "Best Nutrition Platform", organisation: "South Asia Health Tech Summit", description: "Awarded for clinical rigor and user experience." },
];

export const certificationsList = [
  { name: "Academy of Nutrition & Dietetics", description: "Member organisation alignment" },
  { name: "Indian Dietetic Association", description: "Cross-border professional body" },
  { name: "Nepal Health Professional Council", description: "National regulatory body" },
  { name: "ISO 27001:2022", description: "Information security management" },
  { name: "HIPAA Aligned", description: "US health-data privacy framework" },
  { name: "GDPR Compliant", description: "EU data protection regulation" },
];
