import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <main className="auth-page"><AppHeader /><div className="auth-layout"><div className="auth-side"><span>“</span><h2>El ‘no’ también puede necesitar un poco de cardio.</h2><p>— El equipo de Open Date</p></div><AuthForm mode="login" /></div></main>;
}
