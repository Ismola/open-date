import { redirect } from "next/navigation";
import { EventBuilder } from "@/components/EventBuilder";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <EventBuilder user={user} />;
}
