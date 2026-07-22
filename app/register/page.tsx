import { AppHeader } from "@/components/AppHeader";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return <main className="auth-page"><AppHeader /><div className="auth-layout"><div className="auth-side register-side"><span>✦</span><h2>Una buena pregunta merece algo más que un mensaje plano.</h2><p>Hazla memorable.</p></div><AuthForm mode="register" /></div></main>;
}
