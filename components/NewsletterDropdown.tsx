import type { ReactNode } from "react";
import Image from "next/image";

export type NewsletterDropdownData = {
  id: string;
  category: string;
  title: string;
  timeCommitment: string;
  revenuePotential: string;
  thirtyDayIncome?: string;
  secondaryDetails?: string;
  badges?: Array<{
    label: string;
    tone: "attention" | "healthy" | "neutral";
  }>;
  details?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type NewsletterDropdownProps = {
  item: NewsletterDropdownData;
  defaultOpen?: boolean;
  children?: ReactNode;
  secondaryChildren?: ReactNode;
};

export default function NewsletterDropdown({
  item,
  defaultOpen = false,
  children,
  secondaryChildren,
}: NewsletterDropdownProps) {
  function badgeClassName(tone: "attention" | "healthy" | "neutral") {
    if (tone === "attention") {
      return "border-amber-400/80 bg-amber-400/15 text-amber-300";
    }

    if (tone === "healthy") {
      return "border-lime-400/80 bg-lime-400/15 text-lime-300";
    }

    return "border-foreground/30 bg-foreground/10 app-text-muted";
  }

  return (
    <details
      className="app-panel relative mb-10 overflow-hidden"
      style={{
        borderWidth: "4px",
        borderColor: "color-mix(in srgb, var(--app-text) 30%, transparent)",
      }}
      open={defaultOpen}
    >
      <summary className="relative flex cursor-pointer list-none items-center gap-4 p-5 pr-40 [&::-webkit-details-marker]:hidden">
        <span
          className="pointer-events-none absolute left-3 top-3 z-10 h-2.5 w-2.5 rounded-full bg-[#65e26d]"
          aria-hidden="true"
        />
        <div className="absolute right-5 top-4 text-right">
          <p className="app-text-muted underline text-xs">30 Day Income</p>
          <p className="text-2xl text-[#15a71f] font-semibold">{item.thirtyDayIncome ?? "—"}</p>
        </div>
        {item.imageSrc ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-foreground/20">
            <Image
              src={item.imageSrc}
              alt={item.imageAlt ?? `${item.title} logo`}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-foreground/20 text-xl font-semibold">
            {item.title.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="app-text-muted text-md mr-4 underline">{item.category}</p>
            {item.badges?.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full border px-2 py-1 text-xs ${badgeClassName(
                  badge.tone
                )}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <h3 className="truncate text-2xl font-semibold mt-2 leading-tight">
            {item.title}
          </h3>

          <p className="mt-1 text-sm">
            <span className="font-semibold">Time Commitment:</span>{" "}
            {item.timeCommitment}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Revenue Potential:</span>{" "}
            {item.revenuePotential}
          </p>
        </div>
      </summary>

      <div className="border-t border-foreground/15 px-5 pb-5 pt-4">
        <div>
          {children ? (
            children
          ) : (
            <p className="app-text-muted text-sm">
              {item.details ??
                "Placeholder dropdown content. Replace this with hydrated data components for this newsletter card."}
            </p>
          )}
        </div>

        <details className="mt-4">
          <summary className="flex justify-end list-none [&::-webkit-details-marker]:hidden">
            <span className="app-btn-ghost inline-flex cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium">
              More
            </span>
          </summary>

          <div className="mt-3 border-t border-foreground/15 pt-3">
            {secondaryChildren ? (
              secondaryChildren
            ) : (
              <p className="app-text-muted text-sm">
                {item.secondaryDetails ??
                  "Additional dropdown content goes here. Replace with deeper metrics, notes, or controls."}
              </p>
            )}
          </div>
        </details>
      </div>
    </details>
  );
}