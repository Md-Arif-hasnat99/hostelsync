import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Missing CLERK_WEBHOOK_SECRET environment variable", {
      status: 500,
    });
  }

  // Verify the webhook signature using svix
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle new user creation — insert profile
  if (evt.type === "user.created") {
    const { id, first_name, last_name, unsafe_metadata } = evt.data;

    const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;
    const hostel = (unsafe_metadata?.hostel as string) || null;
    const room = (unsafe_metadata?.room as string) || null;
    const role = (unsafe_metadata?.role as string) || "student";

    const supabase = createServiceClient();

    const { error } = await supabase.from("profiles").insert({
      id,              // Clerk user ID (text)
      full_name: fullName,
      hostel,
      room,
      role,            // Extracted from Clerk unsafeMetadata
    });

    if (error) {
      console.error("Failed to create profile:", error);
      return new Response("Failed to create profile", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
