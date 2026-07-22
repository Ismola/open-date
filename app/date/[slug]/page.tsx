import { PublicEventClient } from "@/components/PublicEventClient";

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicEventClient slug={slug} />;
}
