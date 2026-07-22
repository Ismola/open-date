import { redirect } from "next/navigation";
import { EventBuilder } from "@/components/EventBuilder";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  return <EventBuilder user={user} eventId={id} />;
}
