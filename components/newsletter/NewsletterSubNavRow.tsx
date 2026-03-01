import type { ReactNode } from "react";

type NewsletterSubNavRowProps = {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
};

export default function NewsletterSubNavRow({
  leftContent,
  rightContent,
  className,
}: NewsletterSubNavRowProps) {
  return (
    <div
      className={`mx-auto mt-2 flex w-full max-w-6xl items-center justify-between gap-3 overflow-hidden border-t border-foreground/15 pt-2 pb-2 ${className ?? ""}`}
    >
      <div className="min-w-0">{leftContent}</div>
      <div className="shrink-0">{rightContent}</div>
    </div>
  );
}