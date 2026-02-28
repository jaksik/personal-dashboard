"use client";

import NewsletterSelect from "@/components/newsletter/NewsletterSelect";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";

export default function PublishNewsletterSelectControl() {
  const { selectedNewsletterId, setSelectedNewsletterId } = useSelectedNewsletterId();

  return (
    <div className="w-full max-w-sm md:w-72 md:max-w-none">
      <NewsletterSelect value={selectedNewsletterId} onChange={setSelectedNewsletterId} />
    </div>
  );
}
