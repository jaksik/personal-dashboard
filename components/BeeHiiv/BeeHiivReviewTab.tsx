import BeeHiivPayloadGenerator from "@/components/BeeHiiv/BeeHiivPayloadGenerator";
import BeeHiivNewsletterSelector from "@/components/BeeHiiv/BeeHiivNewsletterSelector";

export default function BeeHiivReviewTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <BeeHiivNewsletterSelector />
      </div>
      <BeeHiivPayloadGenerator />
    </div>
  );
}