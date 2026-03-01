import type { NewsletterDropdownData } from "@/components/NewsletterDropdown";

export const newsletterDropdowns: NewsletterDropdownData[] = [
  {
    id: "ai-entrepreneur",
    category: "Email Newsletter",
    title: "The AI Entrepreneur Newsletter",
    timeCommitment: "30 min, 3/week",
    revenuePotential: "$5,000 / week",
    thirtyDayIncome: "$1,400",
    badges: [
      { label: "Action Required", tone: "attention" }
    ],
    imageSrc: "/beehiiv-logo.png",
    imageAlt: "AI Entrepreneur logo",
    details:
      "Use this section for deeper stats, links, or componentized metrics for this newsletter idea.",
  }
];