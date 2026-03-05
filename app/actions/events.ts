"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type CreateSystemEventInput = {
  name: string;
  domain: string;
  scheduledDate: string;
  status: string;
  details?: string;
};

export async function createSystemEventAction(input: CreateSystemEventInput) {
  const name = input.name.trim();
  const domain = input.domain.trim();
  const scheduledDate = input.scheduledDate.trim();
  const status = input.status.trim();
  const details = input.details?.trim();

  if (!name || !domain || !scheduledDate || !status) {
    throw new Error("Missing required event fields.");
  }

  const supabase = await createClient();
  const { error } = await supabase.schema("system").from("events").insert({
    name,
    domain,
    scheduled_date: scheduledDate,
    status,
    details: details && details.length > 0 ? details : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");

  return { success: true };
}
