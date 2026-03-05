import type { ReactNode } from "react";

type MinimalDropdownProps = {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
};

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function MinimalDropdown({
  label,
  children,
  defaultOpen = false,
  className,
  contentClassName,
}: MinimalDropdownProps) {
  return (
    <details open={defaultOpen} className={joinClasses("p-1", className)}>
      <summary className="app-text-muted cursor-pointer list-none select-none text-right text-sm font-medium [&::-webkit-details-marker]:hidden">
        {label}
      </summary>
      <div className={joinClasses("mt-1", contentClassName)}>{children}</div>
    </details>
  );
}
