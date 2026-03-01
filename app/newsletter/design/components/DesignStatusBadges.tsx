"use client";

import { useEffect, useMemo, useState } from "react";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";
import {
  getDesignWorkspaceDataAction,
  type DesignContextNewsletter,
} from "../actions";

type BadgeState = {
  label: string;
  active: boolean;
};

export default function DesignStatusBadges() {
  const { selectedNewsletterId } = useSelectedNewsletterId();
  const [newsletter, setNewsletter] = useState<DesignContextNewsletter | null>(null);

  useEffect(() => {
    async function loadDesignContext() {
      try {
        const payload = await getDesignWorkspaceDataAction(selectedNewsletterId);
        setNewsletter(payload.newsletter);
      } catch {
        setNewsletter(null);
      }
    }

    loadDesignContext();
  }, [selectedNewsletterId]);

  const badgeStates = useMemo<BadgeState[]>(() => {
    const hasTitle = Boolean(newsletter?.title?.trim());
    const hasSubtitle = Boolean(newsletter?.sub_title?.trim());
    const hasImage = Boolean(newsletter?.cover_image?.trim());
    const hasFeature = newsletter?.cover_article != null;

    return [
      { label: "Title", active: hasTitle },
      { label: "Subtitle", active: hasSubtitle },
      { label: "Image", active: hasImage },
      { label: "Feature", active: hasFeature },
    ];
  }, [newsletter]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {badgeStates.map((badge) => (
        <span
          key={badge.label}
          className={
            badge.active
              ? "app-newsletter-assigned-btn inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
              : "inline-flex items-center rounded-full border border-foreground/15 bg-foreground/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/50"
          }
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}