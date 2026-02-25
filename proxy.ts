import { type NextRequest } from "next/server";
import { updateProxySession } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateProxySession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};