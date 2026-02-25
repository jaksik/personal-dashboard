import type { NewsletterDropdownData } from "@/components/NewsletterDropdown";

export const newsletterDropdowns: NewsletterDropdownData[] = [
  {
    id: "ai-entrepreneur",
    category: "Email Newsletter",
    title: "The AI Entrepreneur Newsletter",
    timeCommitment: "30 min, 3/week",
    revenuePotential: "$5,000 / week",
    imageSrc: "/beehiiv-logo.png",
    imageAlt: "AI Entrepreneur logo",
    details:
      "Use this section for deeper stats, links, or componentized metrics for this newsletter idea.",
  },
  {
    id: "growth-ops",
    category: "YouTube Channel",
    title: "Connor Jaksik's YouTube Channel",
    timeCommitment: "45 min, 2/week",
    revenuePotential: "$2,800 / week",
    imageSrc: "/youtube-logo.webp",
    imageAlt: "Growth Ops logo",
    details:
      "Placeholder content for experiments, performance snapshots, and upcoming campaigns.",
  },
  {
    id: "saas-intelligence",
    category: "Email Newsletter",
    title: "SaaS Intelligence Brief",
    timeCommitment: "25 min, daily",
    revenuePotential: "$3,200 / week",
    details:
      "Placeholder content for your future hydrated components, such as trend charts and article blocks.",
  },
];